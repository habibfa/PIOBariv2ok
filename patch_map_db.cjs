const fs = require('fs');
let code = fs.readFileSync('src/MapFacilities.tsx', 'utf-8');

const oldState = `  const [facilities, setFacilities] = useState<Facility[]>(() => {
    const saved = localStorage.getItem("mapFacilitiesData");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return mockFacilities.map(f => ({ ...f, locked: false }));
      }
    }
    return mockFacilities.map(f => ({ ...f, locked: false }));
  });

  useEffect(() => {
    localStorage.setItem("mapFacilitiesData", JSON.stringify(facilities));
  }, [facilities]);`;

const newState = `  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFacilitiesFromDb();
        if (data.length > 0) {
          setFacilities(data.map(f => ({ ...f, locked: false })).sort((a, b) => a.id - b.id));
        } else {
          setFacilities(mockFacilities.map(f => ({ ...f, locked: false })));
        }
      } catch (e) {
        console.error("Failed to load from DB, using mock data", e);
        setFacilities(mockFacilities.map(f => ({ ...f, locked: false })));
      } finally {
        setIsLoadingData(false);
      }
    };
    loadData();
  }, []);

  const saveToDb = async (data: Facility[]) => {
    try {
      await saveFacilitiesToDb(data);
    } catch (e) {
      console.error("Failed to save to DB", e);
      alert("Gagal menyimpan data ke database");
    }
  };`;

code = code.replace(oldState, newState);

const oldValidateAndSetData = `  const validateAndSetData = (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      setFacilities(prev => {
        const newData = parsed.map(item => ({...item, locked: false}));
        const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
        const combined = [...prevFiltered, ...newData];
        return combined.sort((a, b) => a.id - b.id);
      });
      setIsUpdateModalOpen(false);
      setCsvError("");
      setCsvFile(null);
    } else {
      setCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat.");
    }
  };`;

const newValidateAndSetData = `  const validateAndSetData = async (parsed: any[]) => {
    if (parsed.length > 0 && parsed[0].id !== undefined && parsed[0].name !== undefined) {
      const newData = parsed.map(item => ({...item, locked: false}));
      let combined: Facility[] = [];
      setFacilities(prev => {
        const prevFiltered = prev.filter(p => !newData.some(n => n.id === p.id));
        combined = [...prevFiltered, ...newData].sort((a, b) => a.id - b.id);
        return combined;
      });
      setIsUpdateModalOpen(false);
      setCsvError("");
      setCsvFile(null);
      await saveToDb(newData); // Only saving the new/updated ones or all? Actually saveFacilitiesToDb uses batch.set which upserts.
    } else {
      setCsvError("Format file tidak valid. Pastikan baris pertama berisi header yang tepat.");
    }
  };`;

code = code.replace(oldValidateAndSetData, newValidateAndSetData);

fs.writeFileSync('src/MapFacilities.tsx', code);
