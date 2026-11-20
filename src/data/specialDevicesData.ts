// @ts-ignore
import suppositoriaImg from "../assets/images/suppositoria_guide_1782741722992.jpg";
// @ts-ignore
import inhalerImg from "../assets/images/inhaler_guide_1782741740111.jpg";
// @ts-ignore
import tetesMataImg from "../assets/images/tetes_mata_guide_1782741754486.jpg";
// @ts-ignore
import tetesTelingaImg from "../assets/images/tetes_telinga_guide_1782741766653.jpg";
// @ts-ignore
import semprotHidungImg from "../assets/images/semprot_hidung_guide_1782741778450.jpg";
// @ts-ignore
import insulinImg from "../assets/images/pena_insulin_guide_1782741791385.jpg";

export type SpecialDeviceId =
  | "suppositoria"
  | "inhaler"
  | "tetes_mata"
  | "tetes_telinga"
  | "semprot_hidung"
  | "pena_insulin";

export interface DeviceStep {
  title: string;
  desc: string;
  cue: string;
  keyAction: string;
  autoPlayMs: number;
  timerSeconds?: number;
  timerLabel?: string;
}

export interface SpecialDeviceGuide {
  id: SpecialDeviceId;
  title: string;
  shortTitle: string;
  device: string;
  routeLabel: string;
  subtitle: string;
  imageUrl: string;
  storage: string;
  steps: DeviceStep[];
  dos: string[];
  donts: string[];
  counseling: string[];
}

export const SPECIAL_DEVICE_GUIDES: SpecialDeviceGuide[] = [
  {
    id: "suppositoria",
    title: "Penggunaan Suppositoria",
    shortTitle: "Suppositoria",
    device: "Suppositoria Rektal",
    routeLabel: "Rektal · Sediaan Padat",
    subtitle:
      "Pemberian obat padat berbentuk torpedo melalui dubur untuk penyerapan cepat (misal: antipiretik atau laksatif).",
    imageUrl: suppositoriaImg,
    storage:
      "Wajib disimpan di Lemari Es (suhu 2°C - 8°C). Jangan dibekukan. Jika terlalu lunak sebelum dipakai, rendam sebentar dalam wadah tertutup berisi air dingin atau simpan di kulkas beberapa menit.",
    steps: [
      {
        title: "Higienisasi Tangan",
        desc: "Cuci tangan Anda secara menyeluruh menggunakan sabun antiseptik dan air mengalir sebelum memegang obat.",
        cue: "Cuci tangan dengan sabun & air mengalir minimal 20 detik",
        keyAction: "Aseptis Awal",
        autoPlayMs: 5500,
        timerSeconds: 20,
        timerLabel: "Timer Cuci Tangan (20 dtk)",
      },
      {
        title: "Persiapan Sediaan",
        desc: "Buka kemasan foil suppositoria secara perlahan. Jika ujung obat terasa kesat, basahi ujungnya dengan sedikit air bersih atau pelumas berbasis air (water-soluble lubricant) untuk mempermudah pemasukan.",
        cue: "Kupas kemasan foil perlahan & basahi ujung lancip",
        keyAction: "Buka & Lubrikasi",
        autoPlayMs: 6000,
      },
      {
        title: "Atur Posisi Tubuh",
        desc: "Berbaringlah miring ke salah satu sisi (Posisi Sims). Luruskan kaki bagian bawah, dan tekuk lutut kaki bagian atas ke arah dada untuk membuka area rektum.",
        cue: "Posisi Sims: kaki bawah lurus, lutut atas ditekuk ke dada",
        keyAction: "Posisi Sims",
        autoPlayMs: 6000,
      },
      {
        title: "Penyisipan Obat",
        desc: "Masukkan suppositoria ke dalam lubang dubur dengan bagian ujung lancip terlebih dahulu. Dorong perlahan menggunakan jari telunjuk sedalam sekitar 1 ruas jari pada anak-anak atau sekitar 2-3 cm pada orang dewasa.",
        cue: "Ujung lancip masuk dahulu sedalam 2–3 cm (1 ruas jari)",
        keyAction: "Sisipkan 2–3 cm",
        autoPlayMs: 6500,
      },
      {
        title: "Pertahankan Posisi",
        desc: "Rapatkan kedua paha dan tetaplah berbaring miring selama minimal 5-10 menit. Langkah ini krusial agar suppositoria meleleh sepenuhnya oleh suhu tubuh dan tidak terdorong keluar kembali.",
        cue: "Tetap berbaring miring 5–10 menit hingga meleleh oleh suhu 37°C",
        keyAction: "Tahan 5–10 Menit",
        autoPlayMs: 6500,
        timerSeconds: 300,
        timerLabel: "Timer Berbaring (5 mnt)",
      },
      {
        title: "Dekontaminasi Akhir",
        desc: "Cuci tangan Anda kembali dengan sabun dan air mengalir setelah seluruh prosedur selesai untuk menjaga higienitas.",
        cue: "Cuci tangan kembali setelah prosedur selesai",
        keyAction: "Cuci Tangan Akhir",
        autoPlayMs: 5000,
      },
    ],
    dos: [
      "Simpan suppositoria di dalam lemari es (bukan freezer) agar bentuknya tetap padat dan mudah disisipkan.",
      "Jika dosis yang diinstruksikan dokter hanya setengah, potong suppositoria secara vertikal (membujur) menggunakan silet steril agar pembagian zat aktif merata.",
      "Gunakan sarung tangan sekali pakai (apabila ada) untuk kenyamanan dan kebersihan ekstra.",
    ],
    donts: [
      "Jangan memotong suppositoria secara horizontal (melintang), karena distribusi bahan obat aktif di dalam basis supositoria tidak merata.",
      "Hindari mengejan atau buang air besar (defekasi) setidaknya selama 1 jam pertama setelah pemasukan obat agar penyerapan zat aktif maksimal.",
    ],
    counseling: [
      "Bila obat keluar kembali dalam kondisi belum meleleh penuh, masukkan kembali menggunakan jari telunjuk yang bersih sedalam mungkin melampaui sfingter ani.",
      "Untuk anak yang rewel, dekap paha anak dalam posisi merapat selama beberapa menit setelah suppositoria dimasukkan.",
    ],
  },
  {
    id: "inhaler",
    title: "Penggunaan Inhaler (MDI)",
    shortTitle: "Inhaler MDI",
    device: "Metered Dose Inhaler",
    routeLabel: "Inhalasi · Aerosol Semprot",
    subtitle:
      "Pemberian obat bronkodilator atau kortikosteroid langsung ke paru-paru menggunakan inhaler semprot takaran terbatas.",
    imageUrl: inhalerImg,
    storage:
      "Simpan pada suhu ruangan kering (15°C - 25°C). Hindarkan dari paparan sinar matahari langsung, suhu panas ekstrem, atau pembekuan. Pastikan penutup mulut selalu terpasang saat tidak digunakan.",
    steps: [
      {
        title: "Pemeriksaan Alat",
        desc: "Lepaskan penutup corong inhaler. Periksa corong mulut bagian dalam dan luar untuk memastikan tidak ada debu, kotoran, atau benda asing yang menyumbat.",
        cue: "Lepas penutup corong & pastikan lubang semprot bersih",
        keyAction: "Buka & Periksa",
        autoPlayMs: 5500,
      },
      {
        title: "Homogenisasi Obat",
        desc: "Pegang inhaler secara tegak dan kocok dengan kuat sebanyak 5-10 kali agar suspensi obat di dalam kanister tercampur dengan sempurna.",
        cue: "Pegang tegak, kocok kuat 5–10 kali agar suspensi merata",
        keyAction: "Kocok 5–10×",
        autoPlayMs: 5500,
      },
      {
        title: "Ekspirasi Maksimal",
        desc: "Hembuskan napas sedalam-dalamnya melalui mulut secara perlahan, menjauhi corong inhaler, untuk mengosongkan udara dari paru-paru Anda.",
        cue: "Hembuskan napas penuh menjauhi corong inhaler",
        keyAction: "Hembuskan Napas",
        autoPlayMs: 6000,
      },
      {
        title: "Inhalasi Sinkron",
        desc: "Posisikan corong di antara gigi tanpa digigit, lalu rapatkan bibir di sekelilingnya. Mulailah menghirup napas perlahan lewat mulut, lalu tekan bagian atas kanister inhaler (satu semprotan) secara bersamaan sembari melanjutkan hirupan napas dalam-dalam.",
        cue: "Tekan kanister bersamaan saat mulai menghirup perlahan & dalam",
        keyAction: "Tekan + Hirup",
        autoPlayMs: 6500,
      },
      {
        title: "Retensi Napas",
        desc: "Lepaskan inhaler dari mulut Anda. Pejamkan mata dan tahan napas selama 10 detik (atau senyaman yang Anda bisa) agar partikel obat dapat mengendap sempurna di dalam alveoli paru.",
        cue: "Tahan napas 10 detik agar partikel obat mengendap di alveoli",
        keyAction: "Tahan 10 Detik",
        autoPlayMs: 7000,
        timerSeconds: 10,
        timerLabel: "Timer Tahan Napas (10 dtk)",
      },
      {
        title: "Bilas Mulut (Gargle)",
        desc: "Keluarkan napas secara perlahan. Jika Anda menggunakan inhaler golongan kortikosteroid, segeralah berkumur dengan air hangat dan buang airnya (jangan ditelan) untuk mencegah timbulnya sariawan (oral thrush) atau suara serak.",
        cue: "Berkumur air hangat lalu buang (jangan ditelan)",
        keyAction: "Kumur & Buang",
        autoPlayMs: 6000,
      },
    ],
    dos: [
      "Selalu gunakan alat bantu Spacer (tabung antara) terutama untuk anak-anak atau lansia untuk mengatasi masalah koordinasi hisapan.",
      "Pastikan untuk selalu menutup kembali corong inhaler segera setelah selesai digunakan agar tetap steril.",
    ],
    donts: [
      "Jangan menekan tombol inhaler sebelum Anda mulai menghirup napas; hisapan dan semprotan harus dilakukan secara sinkron.",
      "Jangan menghirup napas terlalu cepat atau terburu-buru. Lakukan tarikan napas secara perlahan namun dalam.",
    ],
    counseling: [
      "Jika dokter meresepkan lebih dari 1 semprotan (puff), berikan jeda waktu minimal 30 detik sampai 1 menit sebelum mengulangi langkah pengocokan dan semprotan berikutnya.",
      "Bersihkan corong plastik inhaler minimal seminggu sekali dengan air hangat mengalir lalu keringkan secara alami (jangan dilap tisu).",
    ],
  },
  {
    id: "tetes_mata",
    title: "Penggunaan Tetes Mata",
    shortTitle: "Tetes Mata",
    device: "Obat Tetes Mata Steril",
    routeLabel: "Oftalmik · Cairan Steril",
    subtitle:
      "Pemberian sediaan cair steril langsung pada kantung mata untuk mengatasi infeksi, glaukoma, maupun mata kering.",
    imageUrl: tetesMataImg,
    storage:
      "Simpan pada suhu ruangan sejuk (15°C - 25°C). Hindari pembekuan. CATATAN PENTING: Obat tetes mata botol multi-dosis hanya boleh digunakan maksimal 30 hari setelah segel pertama kali dibuka, meskipun tanggal kedaluwarsa di kemasan masih lama.",
    steps: [
      {
        title: "Aseptis Diri",
        desc: "Cuci tangan Anda dengan sabun antiseptik sampai bersih dan keringkan. Pastikan ujung penetes mata tidak menyentuh permukaan apapun agar tetap steril.",
        cue: "Cuci tangan bersih & jaga sterilitas ujung penetes",
        keyAction: "Sterilitas Ujung",
        autoPlayMs: 5500,
      },
      {
        title: "Pembentukan Kantung",
        desc: "Dongakkan kepala Anda ke belakang. Tarik kelopak mata bawah Anda secara perlahan menggunakan jari telunjuk yang bersih sehingga membentuk kantung konjungtiva kecil.",
        cue: "Dongakkan kepala & tarik kelopak bawah membentuk kantung",
        keyAction: "Tarik Kelopak Bawah",
        autoPlayMs: 6000,
      },
      {
        title: "Penetesan Presisi",
        desc: "Dekatkan botol penetes ke arah mata (jarak ±2 cm, jangan sampai ujung penetes menyentuh bola mata atau bulu mata). Tekan botol dengan lembut agar satu tetes obat jatuh tepat di dalam kantung tersebut.",
        cue: "Jarak botol ±2 cm tanpa menyentuh mata, teteskan 1 tetes",
        keyAction: "Tetes Jarak ±2 cm",
        autoPlayMs: 6500,
      },
      {
        title: "Pejaman Lembut",
        desc: "Lepaskan tarikan jari pada kelopak mata bawah. Tutup mata Anda perlahan-lahan selama minimal 2-3 menit. Hindari mengedipkan mata berulang kali atau memejamkan mata terlalu kencang.",
        cue: "Pejamkan mata perlahan 2–3 menit tanpa mengedip kencang",
        keyAction: "Pejam 2–3 Menit",
        autoPlayMs: 6000,
        timerSeconds: 120,
        timerLabel: "Timer Pejam Mata (2 mnt)",
      },
      {
        title: "Oklusi Lakrimalis",
        desc: "Sembari mata terpejam, tekan sudut dalam mata Anda (dekat hidung) menggunakan ujung jari bersih selama 1-2 menit. Ini mencegah obat mengalir keluar melalui saluran air mata (duktus nasolakrimalis) ke tenggorokan sehingga menghindari efek samping sistemik.",
        cue: "Tekan lembut sudut dalam mata 1–2 menit (oklusi nasolakrimal)",
        keyAction: "Tekan Sudut Dalam",
        autoPlayMs: 6500,
        timerSeconds: 60,
        timerLabel: "Timer Oklusi (1 mnt)",
      },
      {
        title: "Finishing & Higienitas",
        desc: "Lap sisa cairan yang mengalir ke pipi menggunakan tisu bersih. Tutup kembali botol tetes mata dengan rapat tanpa menyentuh atau mengelap ujung penetesnya.",
        cue: "Seka pipi dengan tisu bersih & tutup botol tanpa menyentuh ujung",
        keyAction: "Lap & Tutup Rapat",
        autoPlayMs: 5500,
      },
    ],
    dos: [
      "Lepaskan lensa kontak sebelum meneteskan obat, dan pasang kembali minimal 15 menit setelah penetesan.",
      "Gunakan obat tetes mata terlebih dahulu sebelum salep mata jika Anda diresepkan kedua jenis sediaan tersebut.",
    ],
    donts: [
      "Jangan membiarkan ujung penetes menyentuh jari, kelopak mata, atau bola mata Anda untuk mencegah penularan kuman atau kerusakan sterilitas sediaan.",
      "Jangan menggosok atau mengucek mata Anda setelah penetesan obat.",
    ],
    counseling: [
      "Jika Anda menggunakan lebih dari satu jenis obat tetes mata pada mata yang sama, berikan jeda waktu minimal 5-10 menit antarpemberian agar obat pertama tidak terbilas oleh obat kedua.",
      "Awal penetesan mungkin memicu pandangan buram sesaat. Hindari berkendara sampai penglihatan Anda kembali jernih sepenuhnya.",
    ],
  },
  {
    id: "tetes_telinga",
    title: "Penggunaan Tetes Telinga",
    shortTitle: "Tetes Telinga",
    device: "Obat Tetes Telinga Steril",
    routeLabel: "Otik · Cairan Telinga",
    subtitle:
      "Pemberian obat tetes steril untuk mengatasi infeksi saluran telinga luar (otitis eksterna) atau melunakkan serumen.",
    imageUrl: tetesTelingaImg,
    storage:
      "Simpan pada suhu ruangan kering dan sejuk (15°C - 25°C). Tutup rapat botol setelah digunakan. Jauhkan dari jangkauan anak-anak.",
    steps: [
      {
        title: "Penyesuaian Suhu",
        desc: "Cuci tangan Anda. Genggam botol tetes telinga di telapak tangan selama 1-2 menit. Menghangatkan botol setara suhu tubuh sangat penting untuk mencegah efek pusing berputar (vertigo) akibat stimulasi termal cairan dingin di telinga dalam.",
        cue: "Hangatkan botol di genggaman tangan 1–2 menit setara suhu tubuh",
        keyAction: "Hangatkan 1–2 Menit",
        autoPlayMs: 6000,
        timerSeconds: 60,
        timerLabel: "Timer Hangatkan (1 mnt)",
      },
      {
        title: "Atur Posisi Kepala",
        desc: "Miringkan kepala Anda ke samping atau berbaringlah dengan posisi telinga yang sakit menghadap ke atas.",
        cue: "Miringkan kepala hingga telinga yang sakit menghadap ke atas",
        keyAction: "Telinga Hadap Atas",
        autoPlayMs: 5500,
      },
      {
        title: "Pelebaran Liang Telinga",
        desc: "Luruskan saluran telinga Anda: Untuk DEWASA, tarik daun telinga dengan lembut ke arah atas dan belakang. Untuk ANAK (< 3 tahun), tarik daun telinga ke arah bawah dan belakang.",
        cue: "Dewasa: tarik atas-belakang · Anak <3 thn: tarik bawah-belakang",
        keyAction: "Luruskan Liang",
        autoPlayMs: 6500,
      },
      {
        title: "Aplikasi Tetesan",
        desc: "Teteskan sejumlah obat sesuai dosis anjuran ke dalam liang telinga. Jaga agar ujung botol penetes tidak menyentuh daun telinga atau bagian dalam telinga Anda.",
        cue: "Teteskan sesuai dosis tanpa ujung penetes menyentuh telinga",
        keyAction: "Teteskan Presisi",
        autoPlayMs: 6000,
      },
      {
        title: "Difusi & Absorpsi",
        desc: "Tetap miringkan kepala atau berbaring miring selama 3-5 menit agar cairan obat mengalir sempurna ke bagian dalam saluran telinga.",
        cue: "Pertahankan posisi miring 3–5 menit agar obat mengalir sempurna",
        keyAction: "Diam 3–5 Menit",
        autoPlayMs: 6500,
        timerSeconds: 180,
        timerLabel: "Timer Absorpsi (3 mnt)",
      },
      {
        title: "Pijatan Tragus",
        desc: "Tekan dan pijat secara lembut bagian tragus (tonjolan tulang rawan kecil di depan lubang telinga) beberapa kali untuk mendorong gelembung udara keluar dan membantu obat menyebar merata.",
        cue: "Pijat lembut tragus untuk mengeluarkan gelembung udara",
        keyAction: "Pijat Tragus",
        autoPlayMs: 6000,
      },
    ],
    dos: [
      "Pastikan telinga bersih dari cairan berlebih dengan menyekanya lembut menggunakan tisu sebelum penetesan.",
      "Mintalah bantuan orang lain jika kesulitan meneteskan secara mandiri agar dosis yang masuk akurat.",
    ],
    donts: [
      "Jangan meneteskan obat jika dicurigai atau diketahui gendang telinga Anda robek/perforasi, kecuali diresepkan khusus oleh dokter spesialis THT.",
      "Jangan menyumbat saluran telinga terlalu dalam dengan kapas biasa setelah penetesan karena kapas dapat menyerap obat kembali.",
    ],
    counseling: [
      "Cairan obat yang terasa dingin di dalam telinga dapat memicu refleks batuk atau pusing sesaat. Hal ini normal, namun dapat diminimalisir dengan menghangatkan botol di tangan terlebih dahulu.",
      "Jika setelah beberapa hari telinga terasa gatal menyengat atau nyeri bertambah parah, segera hentikan pemakaian dan konsultasikan ke dokter.",
    ],
  },
  {
    id: "semprot_hidung",
    title: "Penggunaan Semprot Hidung",
    shortTitle: "Semprot Hidung",
    device: "Nasal Spray Aerosol",
    routeLabel: "Intranasal · Semprot Kabut",
    subtitle:
      "Aplikasi obat semprot hidung (nasal spray) untuk meredakan inflamasi mukosa, kongesti, atau rinitis alergi.",
    imageUrl: semprotHidungImg,
    storage:
      "Simpan pada suhu ruangan kering (15°C - 30°C). Jangan dibekukan. Bersihkan ujung aplikator semprot dengan tisu bersih setelah digunakan dan selalu pasang penutup plastik pelindung.",
    steps: [
      {
        title: "Pembersihan Rongga",
        desc: "Hembuskan napas secara perlahan melalui hidung untuk membersihkan rongga hidung dari ingus atau sumbatan sebelum menyemprotkan obat.",
        cue: "Bersihkan rongga hidung perlahan dengan tisu sebelum menyemprot",
        keyAction: "Bersihkan Hidung",
        autoPlayMs: 5500,
      },
      {
        title: "Uji Semprotan (Priming)",
        desc: "Cuci tangan Anda, kocok botol semprot hidung dengan baik. Jika baru pertama kali digunakan atau sudah lama tidak dipakai, semprotkan obat ke udara beberapa kali sampai keluar kabut halus yang merata.",
        cue: "Kocok botol & uji semprot ke udara hingga keluar kabut halus",
        keyAction: "Kocok & Priming",
        autoPlayMs: 6000,
      },
      {
        title: "Posisi Kepala Menunduk",
        desc: "Tundukkan kepala Anda sedikit ke depan (pandangan mengarah ke arah ujung kaki Anda, bukan mendongak).",
        cue: "Tundukkan kepala sedikit ke depan menghadap ujung kaki",
        keyAction: "Tunduk ke Depan",
        autoPlayMs: 5500,
      },
      {
        title: "Injeksi Mengarah Luar",
        desc: "Masukkan ujung aplikator semprot ke dalam salah satu lubang hidung. Arahkan ujung aplikator ke sudut luar mata (ke arah luar/lateral, bukan ke arah septum/sekat tengah hidung) untuk mencegah iritasi septum.",
        cue: "Arahkan ujung nosel ke sisi luar (menjauhi septum tengah)",
        keyAction: "Arah Lateral",
        autoPlayMs: 6500,
      },
      {
        title: "Semprot & Hisap Halus",
        desc: "Tutup lubang hidung yang lain menggunakan jari tangan Anda yang bebas. Tekan pompa aplikator dengan gerakan cepat dan kuat, sembari menghirup napas perlahan dan lembut melalui lubang hidung tersebut.",
        cue: "Tutup lubang hidung sebelahnya, tekan pompa & hirup lembut",
        keyAction: "Tekan + Hirup Halus",
        autoPlayMs: 6500,
      },
      {
        title: "Ekspirasi Oral",
        desc: "Keluarkan ujung semprotan dari hidung Anda dan hembuskan napas secara perlahan melalui mulut. Hindari membuang ingus (bersin) atau mendongakkan kepala ke belakang setidaknya selama 10-15 menit agar obat tidak tertelan.",
        cue: "Hembuskan napas lewat mulut & jangan mendongak 10–15 menit",
        keyAction: "Hembus Lewat Mulut",
        autoPlayMs: 6000,
      },
    ],
    dos: [
      "Gunakan ibu jari di bagian bawah botol dan jari telunjuk serta jari tengah di bagian bahu botol semprot untuk memompa dengan stabil.",
      "Bersihkan ujung semprotan hidung dengan air hangat minimal seminggu sekali agar tidak tersumbat obat kering.",
    ],
    donts: [
      "Jangan mengarahkan semprotan langsung ke septum (sekat tengah hidung) karena dapat memicu iritasi kronis, luka, hingga mimisan.",
      "Jangan mendongakkan kepala ke belakang saat atau segera setelah menyemprot, karena obat akan mengalir ke tenggorokan dan tertelan, mengurangi efektivitas lokalnya.",
    ],
    counseling: [
      "Jika Anda merasakan rasa pahit di tenggorokan setelah pemakaian, minumlah segelas air putih untuk menghilangkannya.",
      "Jangan pernah meminjamkan semprot hidung Anda kepada orang lain karena kontaminasi silang bakteri/virus sangat mudah terjadi melalui mukosa hidung.",
    ],
  },
  {
    id: "pena_insulin",
    title: "Penggunaan Pena Insulin",
    shortTitle: "Pena Insulin",
    device: "Insulin Pen Device",
    routeLabel: "Subkutan · Injeksi Pena",
    subtitle:
      "Penyuntikan insulin subkutan (bawah kulit) secara mandiri untuk mengontrol kadar glukosa darah pada penderita diabetes melitus.",
    imageUrl: insulinImg,
    storage:
      "Pena insulin yang BELUM dibuka harus disimpan di lemari es (suhu 2°C - 8°C), jangan dibekukan. Pena insulin yang SEDANG aktif digunakan disimpan di suhu ruangan sejuk (15°C - 30°C) dan dapat bertahan hingga 28-30 hari. JANGAN memasukkan kembali pena yang sedang aktif digunakan ke dalam kulkas karena suhu dingin dapat membuat injeksi terasa perih.",
    steps: [
      {
        title: "Sterilisasi Area",
        desc: "Cuci tangan Anda. Tentukan area suntikan (perut berjarak minimal 5 cm dari pusar, paha bagian depan, lengan atas bagian luar, atau pantat). Bersihkan area tersebut menggunakan alcohol swab dan biarkan mengering alami.",
        cue: "Pilih area rotasi (≥5 cm dari pusar) & usap alcohol swab",
        keyAction: "Rotasi & Swab",
        autoPlayMs: 6000,
      },
      {
        title: "Pemasangan Jarum",
        desc: "Ambil pena insulin, buka penutup pelindungnya. Ambil jarum suntik steril yang baru, kelupas segel kertasnya, lalu pasang jarum pada ujung pena dengan memutarnya searah jarum jam hingga kencang.",
        cue: "Lepas segel jarum steril baru & putar searah jarum jam",
        keyAction: "Pasang Jarum Baru",
        autoPlayMs: 6000,
      },
      {
        title: "Pembuangan Udara (Priming)",
        desc: "Lakukan priming (air-shot) 2 unit: Putar tombol dosis ke angka 2 unit. Ketuk-ketuk badan pena dengan jari agar gelembung udara naik ke atas. Arahkan jarum tegak lurus ke atas, lalu tekan tombol dosis hingga habis. Pastikan setetes insulin keluar di ujung jarum dan penunjuk dosis kembali ke angka 0.",
        cue: "Setel 2 unit, ketuk udara naik, tekan hingga menetes di ujung",
        keyAction: "Priming 2 Unit",
        autoPlayMs: 6500,
      },
      {
        title: "Pengaturan Dosis",
        desc: "Putar tombol dosis di ujung pena insulin sesuai dengan unit dosis yang telah ditentukan oleh dokter Anda. Pastikan angka pada jendela dosis menunjukkan unit yang benar.",
        cue: "Putar kenop dosis & verifikasi angka unit pada jendela dosis",
        keyAction: "Setel Dosis Unit",
        autoPlayMs: 6000,
      },
      {
        title: "Penyuntikan Subkutan",
        desc: "Cubit lipatan kulit di area suntikan jika tubuh Anda kurus, masukkan jarum secara tegak lurus (90 derajat) ke dalam kulit dengan mantap. Tekan tombol dosis sepenuhnya ke bawah hingga penunjuk kembali ke angka 0.",
        cue: "Suntikkan tegak lurus 90° ke lapisan lemak subkutan hingga 0",
        keyAction: "Injeksi Tegak 90°",
        autoPlayMs: 6500,
      },
      {
        title: "Retensi Jarum & Pelepasan",
        desc: "Tahan jarum tetap berada di bawah kulit selama minimal 10 detik agar seluruh dosis insulin masuk sempurna. Tarik jarum dari kulit, lalu segera lepaskan jarum dari pena insulin menggunakan penutup luarnya untuk dibuang ke wadah khusus benda tajam (sharp container). Pasang kembali penutup pena.",
        cue: "Tahan 10 detik di kulit, lepas jarum ke sharp container",
        keyAction: "Tahan 10 Detik",
        autoPlayMs: 7000,
        timerSeconds: 10,
        timerLabel: "Timer Retensi Jarum (10 dtk)",
      },
    ],
    dos: [
      "Lakukan rotasi lokasi penyuntikan (misal geser 2 cm dari bekas suntikan sebelumnya) untuk mencegah penumpukan lemak/kerusakan jaringan bawah kulit (lipodistrofi).",
      "Gunakan jarum suntik steril yang baru setiap kali melakukan penyuntikan insulin.",
    ],
    donts: [
      "Jangan menyimpan pena insulin dengan jarum masih terpasang karena dapat memicu masuknya gelembung udara atau kebocoran insulin.",
      "Jangan menggosok atau memijat area bekas suntikan, karena pijatan dapat mempercepat penyerapan insulin secara tidak terduga dan memicu serangan hipoglikemia.",
    ],
    counseling: [
      "Kenali gejala hipoglikemia (lemas, gemetar, keringat dingin, lapar berlebih, jantung berdebar). Selalu siapkan tablet glukosa, permen, atau jus buah manis sebagai penanganan cepat.",
      "Periksa kejernihan insulin Anda. Insulin jenis 'Rapid-acting' atau 'Long-acting' analog biasanya jernih, sedangkan insulin jenis 'NPH' atau 'Premixed' biasanya keruh dan memerlukan pengocokan memutar di antara telapak tangan sebanyak 10 kali sebelum digunakan.",
    ],
  },
];
