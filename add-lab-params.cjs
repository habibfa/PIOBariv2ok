const fs = require('fs');
let code = fs.readFileSync('src/MedicalCalculators.tsx', 'utf8');

const newParams = `      // Darah Lengkap (CBC)
      { id: "Hb", category: "Darah Lengkap", label: "Hemoglobin (Hb)", unit: "g/dL", min: 12.0, max: 16.0, lowMsg: "Anemia", highMsg: "Polisitemia", example: "13.5" },
      { id: "Ht", category: "Darah Lengkap", label: "Hematokrit (Ht)", unit: "%", min: 36, max: 50, lowMsg: "Rendah (Anemia/Perdarahan)", highMsg: "Tinggi (Dehidrasi/Polisitemia)", example: "42" },
      { id: "WBC", category: "Darah Lengkap", label: "Leukosit (WBC)", unit: "10^3/µL", min: 4.5, max: 11.0, lowMsg: "Leukopenia (Infeksi virus/Supresi sumsum)", highMsg: "Leukositosis (Infeksi/Inflamasi)", example: "7.5" },
      { id: "PLT", category: "Darah Lengkap", label: "Trombosit (PLT)", unit: "10^3/µL", min: 150, max: 450, lowMsg: "Trombositopenia", highMsg: "Trombositosis", example: "250" },
      
      // Profil Lipid
      { id: "Chol", category: "Profil Lipid", label: "Kolesterol Total", unit: "mg/dL", min: 0, max: 200, lowMsg: "Normal", highMsg: "Hiperkolesterolemia", example: "180" },
      { id: "HDL", category: "Profil Lipid", label: "Kolesterol HDL", unit: "mg/dL", min: 40, max: 100, lowMsg: "Rendah (Risiko Kardiovaskular)", highMsg: "Normal/Baik", example: "55" },
      { id: "LDL", category: "Profil Lipid", label: "Kolesterol LDL", unit: "mg/dL", min: 0, max: 130, lowMsg: "Optimal", highMsg: "Tinggi (Risiko Kardiovaskular)", example: "110" },
      { id: "TG", category: "Profil Lipid", label: "Trigliserida", unit: "mg/dL", min: 0, max: 150, lowMsg: "Normal", highMsg: "Hipertrigliseridemia", example: "120" },
      
      // Gula Darah
      { id: "GDP", category: "Gula Darah", label: "Gula Darah Puasa (GDP)", unit: "mg/dL", min: 70, max: 99, lowMsg: "Hipoglikemia", highMsg: "Prediabetes / Diabetes", example: "90" },
      { id: "GDS", category: "Gula Darah", label: "Gula Darah Sewaktu (GDS)", unit: "mg/dL", min: 70, max: 140, lowMsg: "Hipoglikemia", highMsg: "Curiga Diabetes / Hiperglikemia", example: "115" },
      { id: "HbA1c", category: "Gula Darah", label: "HbA1c", unit: "%", min: 4.0, max: 5.6, lowMsg: "Normal", highMsg: "Prediabetes / Diabetes", example: "5.2" },
      
      { id: "Cr", category: "Fungsi Ginjal", label: "Serum Creatinine", unit: "mg/dL", min: 0.6, max: 1.2, lowMsg: "Rendah", highMsg: "Tinggi (Gangguan Ginjal)", example: "0.9" },`;

code = code.replace(
  '{ id: "Cr", category: "Fungsi Ginjal", label: "Serum Creatinine", unit: "mg/dL", min: 0.6, max: 1.2, lowMsg: "Rendah", highMsg: "Tinggi (Gangguan Ginjal)", example: "0.9" },',
  newParams
);

fs.writeFileSync('src/MedicalCalculators.tsx', code);
console.log("Updated lab parameters.");
