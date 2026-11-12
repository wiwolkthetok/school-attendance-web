/*
 * ============================================================================
 * SI-HADIR IoT - Firmware Mesin Presensi Mandiri Siswa & Dewan Guru
 * SMK Ma'arif 1 Padang Ratu
 * ============================================================================
 * 
 * KOMPONEN PERANGKAT KERAS (HARDWARE):
 * 1. Mikrokontroler : ESP32-WROOM-32 (DevKit V1 30-Pin / 38-Pin)
 * 2. RFID Scanner   : MFRC-522 (RC522) 13.56 MHz
 * 3. Buzzer Aktif   : KY-012 (Active Buzzer Module)
 * 4. Display Layar  : LCD 1602 HD44780 (16 Karakter x 2 Baris)
 * 5. Adaptor LCD    : Modul I2C / IIC Backpack (PCF8574)
 * 
 * ============================================================================
 * DAFTAR LIBRARY YANG DIBUTUHKAN (Install lewat Arduino IDE Library Manager):
 * ============================================================================
 * 1. "MFRC522" by GithubCommunity
 *    -> Buka Arduino IDE -> Sketch -> Include Library -> Manage Libraries...
 *    -> Cari "MFRC522" lalu klik Install.
 * 
 * 2. "LiquidCrystal I2C" by Frank de Brabander / Marco Schwartz
 *    -> Cari "LiquidCrystal I2C" lalu klik Install.
 * 
 * 3. Library Bawaan ESP32 Core (Tidak perlu install manual):
 *    -> <WiFi.h>
 *    -> <HTTPClient.h>
 *    -> <SPI.h>
 *    -> <Wire.h>
 * 
 * ============================================================================
 * SKEMA WIRING / SAMBUNGAN KABEL:
 * ============================================================================
 * [1] MFRC522 RFID READER -> ESP32-WROOM-32
 *     - 3.3V    -> Pin 3V3 (PERINGATAN: WAJIB 3.3V, JANGAN KE 5V!)
 *     - GND     -> Pin GND
 *     - RST     -> GPIO 4  (D4)
 *     - SDA/SS  -> GPIO 5  (D5)
 *     - SCK     -> GPIO 18 (D18)
 *     - MISO    -> GPIO 19 (D19)
 *     - MOSI    -> GPIO 23 (D23)
 * 
 * [2] LCD 1602 DENGAN MODUL I2C -> ESP32-WROOM-32
 *     - VCC     -> Pin VIN / 5V
 *     - GND     -> Pin GND
 *     - SDA     -> GPIO 21 (D21 - Default I2C SDA ESP32)
 *     - SCL     -> GPIO 22 (D22 - Default I2C SCL ESP32)
 * 
 * [3] ACTIVE BUZZER KY-012 -> ESP32-WROOM-32
 *     - Pin S (Signal) -> GPIO 13 (D13)
 *     - Pin - (GND)    -> Pin GND
 * 
 * ============================================================================
 * FITUR UTAMA DALAM KODE INI:
 * ============================================================================
 * 1. STEP 1 (TAP KARTU) : Kartu ditempelkan -> UID RFID terbaca seketika.
 * 2. STEP 2 (DIPROSES)  : Layar menampilkan "MEMPROSES DATA..." & "Mohon Tunggu...".
 * 3. STEP 3 (SUKSES)    : 
 *    - Baris 1: NAMA SISWA bergerak (*Running Text*) jika lebih dari 16 huruf.
 *    - Baris 2: KETERANGAN STATUS (*Static*), contoh: "HADIR [06:45]" atau "TELAT 12m (-5P)".
 * 4. STEP 4 (ANTI-MACET): Menggunakan NON-BLOCKING millis() (Tanpa delay()). 
 *    Jika ada siswa baru menempelkan kartu saat nama siswa lama belum selesai,
 *    layar LANGSUNG MENIMPA dengan proses siswa yang baru!
 * 5. STEP 5 (STANDBY)   : Saat tidak ada yang absen, LCD memunculkan animasi mata
 *    kotak solid dengan ekspresi acak serta sapaan "Halo!" yang muncul pada jeda acak.
 * ============================================================================
 */

#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <HTTPClient.h>
#include <SPI.h>
#include <MFRC522.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>

// ============================================================================
// PANDUAN CEPAT UNTUK PENGEMBANG / TEMAN:
// ============================================================================
// Ada 3 HAL UTAMA yang biasanya WAJIB disesuaikan sebelum sketch di-upload:
// 1. WIFI_SSID & WIFI_PASSWORD : Nama hotspot WiFi dan password tempat mesin dipasang.
// 2. SERVER_URL                : Alamat IP Komputer/Server web aplikasi SI-HADIR.
// 3. LCD_ADDR                  : Alamat modul I2C LCD (Standar: 0x27, beberapa modul: 0x3F).
//
// CATATAN TROUBLESHOOTING LAYAR LCD:
// - Jika layar menyala biru/hijau tapi teks TIDAK MUNCUL sama sekali (atau hanya kotak hitam):
//   1. Putar baut potensiometer/trimpot kecil berwarna biru di belakang modul I2C LCD menggunakan obeng kecil untuk mengatur ketajaman/kontras.
//   2. Jika kontras sudah diputar tapi teks tetap tidak ada, ubah LCD_ADDR dari 0x27 menjadi 0x3F di baris konfigurasi bawah.
//
// LIBRARY YANG HARUS DI-DOWNLOAD (Arduino IDE -> Manage Libraries):
// - "MFRC522" by GithubCommunity
// - "LiquidCrystal I2C" by Frank de Brabander atau Marco Schwartz
// ============================================================================

// ============================================================================
// 1. PENGATURAN KONEKSI WIFI & ALAMAT SERVER [SESUAIKAN DI SINI]
// ============================================================================
// [1A] Ganti dengan nama WiFi (SSID) dan Password hotspot HP / router sekolah:
const char* WIFI_SSID     = "Mess";
const char* WIFI_PASSWORD = "kosekkosek";

// [1B] Alamat Endpoint API Presensi SI-HADIR:
// LOCALHOST hanya untuk aplikasi yang berjalan di laptop itu sendiri.
// ESP32 tidak bisa memakai localhost untuk mengakses laptop.
const String LOCALHOST_URL = "http://localhost:4321/api/attendance";

// Alamat IP LAN laptop/server. ESP32 dan laptop harus berada di jaringan yang sama.
const String NETWORK_URL = "http://192.168.1.5:4321/api/attendance";

// Alamat server online (ganti dengan domain Vercel milikmu).
const String VERCEL_URL = "https://school-attendance-web-flax.vercel.app/api/attendance";

// Pilih metode pengiriman:
// SEND_NETWORK  = server lokal melalui IP LAN
// SEND_VERCEL   = server online Vercel
// SEND_FALLBACK = coba Vercel, jika gagal lanjut ke server LAN
enum SendMethod {
  SEND_NETWORK,
  SEND_VERCEL,
  SEND_FALLBACK
};

//Ganti Metode nya disini
const SendMethod ACTIVE_SEND_METHOD = SEND_VERCEL;

// ============================================================================
// 2. KONFIGURASI PIN & ALAMAT HARDWARE [SESUAIKAN JIKA PERLU]
// ============================================================================
#define SS_PIN       5    // Pin SDA / SS pada Modul MFRC522
#define RST_PIN      22   // Pin RST pada Modul MFRC522
#define BUZZER_PIN   4    // Pin sinyal buzzer

// [2B] Pin Relay Solenoid Kunci Gerbang (Opsional)
// Ganti dengan pin GPIO jika memakai relay gerbang (misal GPIO 2 atau 15), atau -1 jika tidak ada
#define GATE_RELAY_PIN      -1   // -1 jika tidak dipasang
#define GATE_ACTIVE_LOW     true // true jika modul relay active-low
#define GATE_UNLOCK_MS      3000 // Durasi pembukaan gerbang (3 detik)

// [2A] Alamat I2C Layar LCD 1602:
// Alamat default pabrik untuk chip PCF8574T adalah 0x27
#define LCD_ADDR     0x27 
// CATATAN: Jika LCD tetap tidak muncul tulisan (setelah trimpot kontras diputar),
// matikan tanda komentar di bawah ini dan ubah ke 0x3F (untuk chip PCF8574AT):
// #define LCD_ADDR     0x3F 

#define LCD_COLS     16   // Jumlah kolom LCD (16 karakter)
#define LCD_ROWS     2    // Jumlah baris LCD (2 baris)

LiquidCrystal_I2C lcd(LCD_ADDR, LCD_COLS, LCD_ROWS);
MFRC522 rfid(SS_PIN, RST_PIN);

// ============================================================================
// 3. CUSTOM GLYPHS: MATA IMO KOTAK SOLID TANPA PUPIL
// Satu mata = satu karakter LCD 5x8. Mata bergerak dengan memindahkan
// seluruh glyph ke kolom LCD sebelah kiri/kanan, bukan menggeser pupil.
// Slot CGRAM 0 = mata kotak solid, slot 1 = mata berkedip.
// ============================================================================
byte eyeSolid[8] = {
  B00000,
  B11111, B11111, B11111, B11111, B11111,
  B00000, B00000
};

byte eyeClosed[8] = {
  B00000, B00000, B00000, B11111,
  B11111, B00000, B00000, B00000
};

byte eyeSleepy[8] = {
  B00000,
  B00000, B11111, B11111, B11111,
  B00000, B00000, B00000
};

byte eyeSurprised[8] = {
  B01110,
  B11111, B11111, B11111, B11111, B11111,
  B01110, B00000
};

// ============================================================================
// CUSTOM GLYPHS: MULUT ROBOT INTERAKTIF & EKSPRESIF
// ============================================================================
// Slot 4: Mulut Senyum (Smile)
byte mouthSmile[8] = {
  B00000,
  B00000,
  B00000,
  B10001,
  B10001,
  B01110,
  B00000,
  B00000
};

// Slot 5: Mulut Terbuka / Kaget / Bicara (Open O)
byte mouthOpen[8] = {
  B00000,
  B00000,
  B01110,
  B10001,
  B10001,
  B01110,
  B00000,
  B00000
};

// Slot 6: Mulut Senyum Lebar / Gembira / Smirk (Happy)
byte mouthHappy[8] = {
  B00000,
  B00000,
  B11111,
  B11111,
  B01110,
  B00100,
  B00000,
  B00000
};

// Slot 7: Mulut Datar / Tenang / Rileks (Flat -)
byte mouthFlat[8] = {
  B00000,
  B00000,
  B00000,
  B11111,
  B00000,
  B00000,
  B00000,
  B00000
};

// ============================================================================
// ============================================================================
// 4. VARIABEL KONTROL STATE MACHINE (NON-BLOCKING DENGAN millis())
// ============================================================================
enum MachineState {
  STATE_STANDBY,     // Mode standby menampilkan ekspresi mata dan sapaan robot
  STATE_PROCESSING,  // Sedang kirim HTTP ke server
  STATE_DISPLAY_NAME // Menampilkan nama siswa (running text) & status hadir/telat
};

MachineState currentState = STATE_STANDBY;

// Data hasil absensi siswa saat ini
String currentStudentName = "";
String currentStatusLine  = "";

// Timer untuk animasi running text (teks berjalan)
unsigned long lastScrollMillis = 0;
const unsigned long SCROLL_INTERVAL = 280; // Geser per 280 milidetik
int scrollIndex = 0;

// Timer untuk kembali ke Standby setelah selesai absensi
unsigned long displayDoneStartMillis = 0;
const unsigned long DISPLAY_HOLD_TIME = 4500; // Tampilkan nama selama 4.5 detik jika tidak ada yang tap

// Timer untuk animasi mata standby
unsigned long lastIdleAnimMillis = 0;
int idleFrame = 0;

// Dialog tunggal "Halo!" yang muncul dengan jeda acak.
uint8_t robotTypedChars = 0;
unsigned long lastRobotTypeMillis = 0;
unsigned long robotNextGreetingMillis = 0;
unsigned long robotGreetingShownMillis = 0;
const unsigned long ROBOT_TYPE_INTERVAL = 180;
const unsigned long ROBOT_GREETING_HOLD = 1700;
bool robotGreetingVisible = false;
bool robotGreetingHolding = false;

// Proteksi anti-dobel baca kartu yang sama persis
String lastScannedUID = "";
unsigned long lastScanMillis = 0;
const unsigned long COOLDOWN_SAME_CARD = 2500; // Cooldown 2.5 detik untuk kartu yang sama

// ============================================================================
// 5. HELPER NADA BUZZER KY-012 & RELAY GERBANG
// ============================================================================
void beepBeep(int count, int onTime, int offTime) {
  for (int i = 0; i < count; i++) {
    digitalWrite(BUZZER_PIN, LOW);   // Buzzer ON (active-low), sesuai kode acuan
    delay(onTime);
    digitalWrite(BUZZER_PIN, HIGH);  // Buzzer OFF
    if (i < count - 1) delay(offTime);
  }
}

bool isGateOpen = false;
unsigned long gateUnlockMillis = 0;

void controlGate(bool unlock) {
  if (GATE_RELAY_PIN < 0) return;
  if (unlock) {
    digitalWrite(GATE_RELAY_PIN, GATE_ACTIVE_LOW ? LOW : HIGH);
    isGateOpen = true;
    gateUnlockMillis = millis();
    Serial.println("[GATE] Relay AKTIF: Solenoid Terbuka (Akses Diberikan)");
  } else {
    digitalWrite(GATE_RELAY_PIN, GATE_ACTIVE_LOW ? HIGH : LOW);
    isGateOpen = false;
    Serial.println("[GATE] Relay NONAKTIF: Solenoid Terkunci");
  }
}

// ============================================================================
// 6. HELPER PARSING JSON RINGAN (Tanpa butuh library JSON berat di ESP32)
// ============================================================================
String extractJsonValue(String json, String key) {
  String searchKey = "\"" + key + "\":\"";
  int startIdx = json.indexOf(searchKey);
  if (startIdx != -1) {
    startIdx += searchKey.length();
    int endIdx = json.indexOf("\"", startIdx);
    if (endIdx != -1) return json.substring(startIdx, endIdx);
  }
  // Cek jika nilainya angka / boolean / tanpa kutip
  searchKey = "\"" + key + "\":";
  startIdx = json.indexOf(searchKey);
  if (startIdx != -1) {
    startIdx += searchKey.length();
    int commaIdx = json.indexOf(",", startIdx);
    int braceIdx = json.indexOf("}", startIdx);
    int endIdx = -1;
    if (commaIdx != -1 && braceIdx != -1) {
      endIdx = min(commaIdx, braceIdx);
    } else if (commaIdx != -1) {
      endIdx = commaIdx;
    } else {
      endIdx = braceIdx;
    }
    if (endIdx != -1) {
      String val = json.substring(startIdx, endIdx);
      val.trim();
      return val;
    }
  }
  return "";
}

// ============================================================================
// 7. SISTEM UCAPAN ROBOT ("Halo!" DI SISI KANAN SECARA ACAK)
// ============================================================================
uint8_t currentMouthCol = 7; // Posisi kolom mulut saat ini

void scheduleNextGreeting(unsigned long now) {
  // "Halo!" muncul pada jeda acak 4-10 detik
  robotNextGreetingMillis = now + random(4000, 10001);
}

void resetRobotSpeech() {
  robotTypedChars = 0;
  robotGreetingVisible = false;
  robotGreetingHolding = false;
  lastRobotTypeMillis = millis();
  
  // Bersihkan area teks di sisi kanan (Baris 1, Kolom 11-15)
  lcd.setCursor(11, 1);
  lcd.print("     ");
  
  scheduleNextGreeting(millis());
}

void updateRobotSpeech(unsigned long now) {
  const char* greeting = "Halo!";
  const uint8_t greetingLength = 5;

  if (!robotGreetingVisible) {
    if ((long)(now - robotNextGreetingMillis) >= 0) {
      robotGreetingVisible = true;
      robotGreetingHolding = false;
      robotTypedChars = 0;
      lastRobotTypeMillis = now;
      lcd.setCursor(11, 1);
      lcd.print("     "); // Bersihkan area teks samping sebelum mengetik
    }
    return;
  }

  if (!robotGreetingHolding) {
    if (now - lastRobotTypeMillis >= ROBOT_TYPE_INTERVAL) {
      lastRobotTypeMillis = now;
      if (robotTypedChars < greetingLength) {
        robotTypedChars++;
        lcd.setCursor(11, 1);
        for (uint8_t i = 0; i < robotTypedChars; i++) {
          lcd.print(greeting[i]);
        }
        // Animasi mulut bicara: buka-tutup bergantian saat sapaan "Halo!" diketik
        lcd.setCursor(currentMouthCol, 1);
        lcd.write((robotTypedChars % 2 == 1) ? 5 : 4); // mouthOpen <-> mouthSmile
      }

      if (robotTypedChars >= greetingLength) {
        robotGreetingHolding = true;
        robotGreetingShownMillis = now;
        // Selesai menyapa: mulut tersenyum lebar senang
        lcd.setCursor(currentMouthCol, 1);
        lcd.write(6); // mouthHappy
      }
    }
  } else if (now - robotGreetingShownMillis >= ROBOT_GREETING_HOLD) {
    robotGreetingVisible = false;
    robotGreetingHolding = false;
    robotTypedChars = 0;
    lcd.setCursor(11, 1);
    lcd.print("     "); // Hapus kembali tulisan "Halo!"
    // Mulut kembali senyum normal
    lcd.setCursor(currentMouthCol, 1);
    lcd.write(4); // mouthSmile
    scheduleNextGreeting(now);
  }
}

// ============================================================================
// ANIMASI WAJAH STANDBY: MATA (BARIS 0) & MULUT EKSPRESIF (BARIS 1) DI TENGAH
// Wajah berada di tengah layar, teks "Halo!" muncul di samping kanan (Kolom 11-15)
// ============================================================================
void drawIdleFace(int expression) {
  // Wajah tetap di tengah: Mata kiri (5), Mata kanan (10), Mulut (7)
  const uint8_t centerLeft  = 5;
  const uint8_t centerRight = 10;
  const uint8_t centerMouth = 7;

  uint8_t leftCol  = centerLeft;
  uint8_t rightCol = centerRight;
  uint8_t mouthCol = centerMouth;

  uint8_t leftGlyph  = 0;  // eyeSolid
  uint8_t rightGlyph = 0;  // eyeSolid
  uint8_t mouthGlyph = 4;  // mouthSmile (slot 4)

  switch (expression) {
    case 1: // Melirik kiri
      leftCol--; rightCol--; mouthCol--;
      mouthGlyph = 4; // mouthSmile
      break;
    case 2: // Melirik kanan
      leftCol++; rightCol++; mouthCol++;
      mouthGlyph = 4; // mouthSmile
      break;
    case 3: // Berkedip
      leftGlyph = rightGlyph = 1; // eyeClosed
      mouthGlyph = 7;             // mouthFlat (garis datar rileks)
      break;
    case 4: // Mengantuk
      leftGlyph = rightGlyph = 2; // eyeSleepy
      mouthGlyph = 5;             // mouthOpen (menguap)
      break;
    case 5: // Terkejut: mata lebih tinggi & mulut bulat O!
      leftGlyph = rightGlyph = 3; // eyeSurprised
      mouthGlyph = 5;             // mouthOpen
      break;
    case 6: // Kedip sebelah kanan (wink jahil)
      rightGlyph = 1;             // eyeClosed
      mouthGlyph = 6;             // mouthHappy (senyum lebar/smirk)
      break;
    case 7: // Kedip sebelah kiri (wink ceria)
      leftGlyph = 1;              // eyeClosed
      mouthGlyph = 6;             // mouthHappy
      break;
    case 8: // Penasaran: satu mata sleepy, mulut miring sedikit
      rightGlyph = 2;             // eyeSleepy
      mouthGlyph = 5;             // mouthOpen
      mouthCol = 8;
      break;
    default: // Netral (ekspresi 0)
      leftGlyph = rightGlyph = 0; // eyeSolid
      mouthGlyph = 4;             // mouthSmile
      break;
  }

  currentMouthCol = mouthCol;

  // Bersihkan Baris 0 seluruhnya (16 kolom) agar tidak ada kotak mata yang tertinggal di kolom 11 saat melirik
  lcd.setCursor(0, 0);
  lcd.print("                ");
  // Bersihkan Baris 1 area wajah saja (Kolom 0-10), agar tulisan "Halo!" di kolom 11-15 tidak terganggu
  lcd.setCursor(0, 1);
  lcd.print("           ");

  // Gambar Mata di Baris 0 (Tengah)
  lcd.setCursor(leftCol, 0);
  lcd.write(leftGlyph);
  lcd.setCursor(rightCol, 0);
  lcd.write(rightGlyph);

  // Gambar Mulut di Baris 1 (Tepat di bawah mata, Tengah)
  lcd.setCursor(mouthCol, 1);
  lcd.write(mouthGlyph);
}

// ============================================================================
// ============================================================================
// 8. FUNGSI RUNNING TEXT NAMA SISWA (BARIS 1) & STATUS (BARIS 2)
// ============================================================================
void updateRunningText() {
  // Jika nama siswa 16 huruf atau kurang: Tampilkan langsung tanpa digeser
  if (currentStudentName.length() <= LCD_COLS) {
    lcd.setCursor(0, 0);
    String line = currentStudentName;
    while (line.length() < LCD_COLS) line += " ";
    lcd.print(line);
  } 
  // Jika nama siswa panjang (> 16 karakter): Geser teks per karakter
  else {
    String paddedName = currentStudentName + "    *    " + currentStudentName;
    int maxIndex = currentStudentName.length() + 9;
    
    String visibleText = paddedName.substring(scrollIndex, scrollIndex + LCD_COLS);
    lcd.setCursor(0, 0);
    lcd.print(visibleText);
    
    scrollIndex++;
    if (scrollIndex >= maxIndex) {
      scrollIndex = 0;
    }
  }

  // Baris 2 selalu menampilkan status kehadiran tetap (Static)
  lcd.setCursor(0, 1);
  String line2 = currentStatusLine;
  while (line2.length() < LCD_COLS) line2 += " ";
  lcd.print(line2);
}

// Deklarasi awal fungsi pengiriman (implementasi berada setelah processCardAttendance).
bool sendToLocalhost(String uid, String &responseBody);
bool sendToVercel(String uid, String &responseBody);
bool sendWithFallback(String uid, String &responseBody);
bool sendAttendanceData(String uid, String &responseBody);

// ============================================================================
// 9. PROSES TRANSAKSI KE SERVER API (/api/attendance)
// ============================================================================
void processCardAttendance(String uid) {
  // Set state langsung ke PROCESSING
  currentState = STATE_PROCESSING;
  
  // Tampilkan feedback seketika di LCD
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("MEMPROSES KARTU.");
  lcd.setCursor(0, 1);
  lcd.print("ID: " + uid.substring(0, 9));

  // Cek koneksi WiFi
  if (WiFi.status() != WL_CONNECTED) {
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WIFI TERPUTUS!");
    lcd.setCursor(0, 1);
    lcd.print("Menghubungkan...");
    beepBeep(3, 100, 100);
    WiFi.reconnect();
    currentState = STATE_STANDBY;
    return;
  }

  // Kirim UID menggunakan metode yang dipilih pada ACTIVE_SEND_METHOD.
  // Response body tetap disimpan untuk diproses dan ditampilkan pada LCD.
  String response = "";
  bool sendSuccess = sendAttendanceData(uid, response);

  if (sendSuccess) {
    Serial.println("[HTTP BODY]: " + response);

    String status   = extractJsonValue(response, "status");
    String code     = extractJsonValue(response, "code");
    String message  = extractJsonValue(response, "message");
    String line1    = extractJsonValue(response, "line1");
    String line2    = extractJsonValue(response, "line2");
    String beepStr  = extractJsonValue(response, "beep");
    String gateStr  = extractJsonValue(response, "gate");
    String name     = extractJsonValue(response, "name");
    String timeStr  = extractJsonValue(response, "time");
    String pointsStr= extractJsonValue(response, "points");
    int points = pointsStr.length() > 0 ? pointsStr.toInt() : 100;

    // 1. Tentukan teks Baris 1 & Baris 2 LCD sesuai instruksi server web
    String lcdLine1 = line1;
    String lcdLine2 = line2;

    // Untuk kehadiran sukses, gunakan nama lengkap jika ada agar running text berjalan
    if (status == "success") {
      if (name.length() > 0) {
        lcdLine1 = name;
      } else if (lcdLine1.length() == 0) {
        lcdLine1 = "Siswa Civitas";
      }
    }

    // Fallback cadangan jika line1 atau line2 kosong dari respon
    if (lcdLine1.length() == 0 || lcdLine2.length() == 0) {
      if (code == "CARD_UNKNOWN" || message.indexOf("belum terdaftar") != -1) {
        lcdLine1 = "KARTU TDK ADA";
        lcdLine2 = "HUBUNGI PETUGAS";
      } else if (code == "LATE_CLOSED" || message.indexOf("ditutup") != -1) {
        lcdLine1 = "GERBANG TUTUP";
        lcdLine2 = "TERLAMBAT";
      } else if (code == "POINTS_ZERO" || message.indexOf("Poin 0") != -1) {
        lcdLine1 = "AKSES TERKUNCI";
        lcdLine2 = "POIN ANDA 0";
      } else if (code == "BEFORE_OPEN" || message.indexOf("belum dibuka") != -1) {
        lcdLine1 = "BELUM BUKA";
        lcdLine2 = "GERBANG TUTUP";
      } else if (code == "EARLY_LEAVE") {
        lcdLine1 = "BLM JAM PULANG";
        lcdLine2 = "BELUM PULANG";
      } else if (code == "ALREADY_TAPPED" || status == "warning") {
        lcdLine1 = "SUDAH ABSEN";
        lcdLine2 = timeStr.length() >= 5 ? timeStr.substring(0, 5) + " WIB" : "HARI INI";
      } else if (code == "ALUMNI_INACTIVE") {
        lcdLine1 = "KARTU ALUMNI";
        lcdLine2 = "TIDAK AKTIF";
      } else if (status == "success") {
        lcdLine1 = name.length() > 0 ? name : "Siswa Civitas";
        if (code == "SUCCESS_LATE" || response.indexOf("Terlambat") != -1) {
          lcdLine2 = "TELAT - POIN " + String(points);
        } else if (code == "SUCCESS_PULANG" || response.indexOf("Pulang") != -1) {
          lcdLine2 = "PULANG [" + (timeStr.length() >= 5 ? timeStr.substring(0, 5) : "SIANG") + "]";
        } else {
          lcdLine2 = "HADIR - POIN " + String(points);
        }
      } else {
        lcdLine1 = "AKSES DITOLAK!";
        lcdLine2 = message.length() > 0 ? message.substring(0, 16) : "DATA TIDAK COCOK";
      }
    }

    // 2. Kontrol Jumlah Ketukan Buzzer KY-012
    int beepCount = 1;
    if (beepStr.length() > 0) {
      beepCount = beepStr.toInt();
    } else {
      if (code == "POINTS_ZERO") beepCount = 4;
      else if (code == "CARD_UNKNOWN" || code == "LATE_CLOSED" || code == "ALUMNI_INACTIVE" || status == "error") beepCount = 3;
      else if (code == "SUCCESS_LATE" || code == "ALREADY_TAPPED" || code == "BEFORE_OPEN" || code == "EARLY_LEAVE") beepCount = 2;
      else beepCount = 1;
    }

    if (beepCount == 1) {
      beepBeep(1, 150, 0); // 1x Beep Sukses
    } else if (beepCount == 2) {
      beepBeep(2, 120, 80); // 2x Beep Peringatan / Telat / Double-Tap
    } else if (beepCount == 3) {
      beepBeep(3, 140, 80); // 3x Beep Ditolak / Belum Terdaftar
    } else if (beepCount >= 4) {
      beepBeep(beepCount, 100, 70); // 4x Beep Kritis / Poin Habis
    }

    // 3. Kontrol Relay Solenoid Kunci Gerbang
    bool gateUnlock = (gateStr == "true") || (status == "success" && gateStr != "false");
    controlGate(gateUnlock);

    // 4. Update data tampilan LCD & Jalankan Running Text
    currentStudentName = lcdLine1;
    currentStatusLine  = lcdLine2;
    scrollIndex = 0;
    currentState = STATE_DISPLAY_NAME;
    displayDoneStartMillis = millis();
    lastScrollMillis = millis();
    lcd.clear();
    updateRunningText();

    Serial.printf("[ATTENDANCE] Code: %s | Status: %s | Gate: %s | Beep: %d\n", 
                  code.c_str(), status.c_str(), gateUnlock ? "OPEN (Buka)" : "LOCKED (Terkunci)", beepCount);
    Serial.printf("[LCD 1]: %s\n", currentStudentName.c_str());
    Serial.printf("[LCD 2]: %s\n\n", currentStatusLine.c_str());
  } else {
    // Gagal kirim ke server (Koneksi putus / Server Down)
    currentStudentName = "SERVER ERROR!";
    currentStatusLine  = "Periksa Jaringan";
    scrollIndex = 0;
    currentState = STATE_DISPLAY_NAME;
    displayDoneStartMillis = millis() - 1500;
    lastScrollMillis = millis();
    lcd.clear();
    updateRunningText();
    beepBeep(4, 80, 60);
    controlGate(false);
  }

}

// ============================================================================
// MODUL FUNGSI PENGIRIMAN MULTI-SERVER
// ============================================================================

// Nama fungsi dipertahankan mengikuti file acuan.
// Fungsi ini mengirim ke server lokal melalui IP LAN (NETWORK_URL).
// Jangan gunakan LOCALHOST_URL dari ESP32: "localhost" menunjuk ke ESP32 itu sendiri.
bool sendToLocalhost(String uid, String &responseBody) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[LOCAL] WiFi belum terhubung!");
    return false;
  }

  HTTPClient http;
  http.begin(NETWORK_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(4500);

  String payload = "{\"uid\":\"" + uid + "\"}";
  Serial.println("\n[LOCAL] Mengirim ke server LAN: " + NETWORK_URL);

  int httpCode = http.POST(payload);
  Serial.printf("[LOCAL] Status Code: %d\n", httpCode);

  bool success = (httpCode >= 200 && httpCode < 300);
  if (httpCode > 0) {
    responseBody = http.getString();
    Serial.println("[LOCAL] Response Body: " + responseBody);
  } else {
    Serial.printf("[LOCAL] Gagal terhubung: %s\n",
                  http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

// Mengirim ke server online Vercel melalui HTTPS.
bool sendToVercel(String uid, String &responseBody) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[VERCEL] WiFi belum terhubung!");
    return false;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Untuk pengujian; validasi sertifikat lebih aman untuk produksi.

  HTTPClient http;
  http.begin(client, VERCEL_URL);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(6000);

  String payload = "{\"uid\":\"" + uid + "\"}";
  Serial.println("\n[VERCEL] Mengirim ke: " + VERCEL_URL);

  int httpCode = http.POST(payload);
  Serial.printf("[VERCEL] Status Code: %d\n", httpCode);

  bool success = (httpCode >= 200 && httpCode < 300);
  if (httpCode > 0) {
    responseBody = http.getString();
    Serial.println("[VERCEL] Response Body: " + responseBody);
  } else {
    Serial.printf("[VERCEL] Gagal terhubung: %s\n",
                  http.errorToString(httpCode).c_str());
  }

  http.end();
  return success;
}

// Fallback: coba Vercel terlebih dahulu, lalu server LAN jika Vercel gagal.
bool sendWithFallback(String uid, String &responseBody) {
  Serial.println("\n[SYNC] Memulai pengiriman dengan sistem Fallback...");

  Serial.println("[SYNC] [1/2] Mencoba Vercel...");
  if (sendToVercel(uid, responseBody)) {
    Serial.println("[SYNC] Sukses melalui Vercel.");
    return true;
  }

  Serial.println("[SYNC] Vercel gagal. Mencoba server LAN...");
  responseBody = "";
  if (sendToLocalhost(uid, responseBody)) {
    Serial.println("[SYNC] Sukses melalui server LAN.");
    return true;
  }

  Serial.println("[SYNC] ERROR: Vercel dan server LAN gagal dihubungi.");
  return false;
}

// Satu pintu pengiriman data. Ubah ACTIVE_SEND_METHOD di konfigurasi
// untuk mengganti metode tanpa mengubah processCardAttendance().
bool sendAttendanceData(String uid, String &responseBody) {
  responseBody = "";

  switch (ACTIVE_SEND_METHOD) {
    case SEND_NETWORK:
      Serial.println("[MODE] NETWORK / SERVER LAN");
      return sendToLocalhost(uid, responseBody);

    case SEND_VERCEL:
      Serial.println("[MODE] VERCEL");
      return sendToVercel(uid, responseBody);

    case SEND_FALLBACK:
      Serial.println("[MODE] FALLBACK (VERCEL -> NETWORK)");
      return sendWithFallback(uid, responseBody);

    default:
      Serial.println("[MODE] Metode pengiriman tidak dikenal!");
      return false;
  }
}

// ============================================================================
// 10. SETUP INISIALISASI PERANGKAT KERAS
// ============================================================================
void setup() {
  Serial.begin(115200);
  randomSeed(esp_random());
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, HIGH); // Buzzer default MATI (active-low)

  // Inisialisasi Relay Solenoid Kunci Gerbang jika dipasang
  if (GATE_RELAY_PIN >= 0) {
    pinMode(GATE_RELAY_PIN, OUTPUT);
    digitalWrite(GATE_RELAY_PIN, GATE_ACTIVE_LOW ? HIGH : LOW); // Gerbang default terkunci
  }

  // Inisialisasi SPI & RFID Reader RC522 (urutan mengikuti kode acuan yang berhasil)
  SPI.begin(18, 19, 23, 5); // SCK, MISO, MOSI, SS
  delay(50);
  rfid.PCD_Init();
  delay(50);
  rfid.PCD_AntennaOn();
  Serial.println("[RC522] Inisialisasi selesai. Versi firmware reader:");
  rfid.PCD_DumpVersionToSerial();

  // Inisialisasi I2C & Layar LCD 1602
  Wire.begin(21, 27); // SDA = GPIO 21, SCL = GPIO 27
  lcd.init();
  lcd.backlight();

  // Daftarkan empat variasi mata (0-3) dan empat variasi mulut (4-7)
  lcd.createChar(0, eyeSolid);
  lcd.createChar(1, eyeClosed);
  lcd.createChar(2, eyeSleepy);
  lcd.createChar(3, eyeSurprised);
  lcd.createChar(4, mouthSmile);
  lcd.createChar(5, mouthOpen);
  lcd.createChar(6, mouthHappy);
  lcd.createChar(7, mouthFlat);

  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("SMK MA'ARIF 1 PR");
  lcd.setCursor(0, 1);
  lcd.print("Inisialisasi IoT");
  beepBeep(1, 100, 0);
  delay(1200);

  // Koneksi ke Jaringan WiFi
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print("Menghubungkan...");
  lcd.setCursor(0, 1);
  lcd.print(String(WIFI_SSID).substring(0, LCD_COLS));

  int retry = 0;
  while (WiFi.status() != WL_CONNECTED && retry < 25) {
    delay(400);
    Serial.print(".");
    retry++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Terhubung! IP: " + WiFi.localIP().toString());
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WIFI TERHUBUNG!");
    lcd.setCursor(0, 1);
    lcd.print(WiFi.localIP().toString());
    beepBeep(2, 80, 80);
    delay(1500);
  } else {
    Serial.println("\nWiFi Gagal! Periksa Password/SSID.");
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("WIFI GAGAL!");
    lcd.setCursor(0, 1);
    lcd.print("Cek Pengaturan");
    beepBeep(3, 150, 100);
    delay(2000);
  }

  // Siap masuk mode standby.
  // Hapus pesan Wi-Fi/IP terlebih dahulu agar tidak bertabrakan dengan wajah.
  currentState = STATE_STANDBY;
  lcd.clear();
  idleFrame = 0;
  drawIdleFace(idleFrame);
  resetRobotSpeech();
  lastIdleAnimMillis = millis();
}

// ============================================================================
// 11. LOOP UTAMA: NON-BLOCKING (ANTI-MACET & BISA LANGSUNG MENIMPA SISWA BARU)
// ============================================================================
void loop() {
  unsigned long now = millis();

  // Otomatis mengunci kembali relay gerbang setelah durasi pembukaan (GATE_UNLOCK_MS)
  if (isGateOpen && (now - gateUnlockMillis >= GATE_UNLOCK_MS)) {
    controlGate(false);
  }

  // --------------------------------------------------------------------------
  // BAGIAN A: SCANNER RFID (Selalu dipindai di setiap milidetik)
  // --------------------------------------------------------------------------
  // KUNCI FITUR NOMOR 4:
  // Walaupun nama siswa sebelumnya belum selesai bergeser di layar, jika ada
  // kartu siswa baru yang menempel, pembacaan ini LANGSUNG BERHASIL dan
  // LANGSUNG MEMUTUS animasi siswa lama untuk memproses siswa baru!
  // --------------------------------------------------------------------------
  if (rfid.PICC_IsNewCardPresent()) {
    Serial.println("[RC522] Kartu terdeteksi, membaca UID...");

    if (!rfid.PICC_ReadCardSerial()) {
      Serial.println("[RC522] Gagal membaca UID. Coba posisikan ulang kartu.");
      return;
    }
    
    // Baca UID Kartu ke Format Heksadesimal Bersih
    String rawUid = "";
    for (byte i = 0; i < rfid.uid.size; i++) {
      if (rfid.uid.uidByte[i] < 0x10) rawUid += "0";
      rawUid += String(rfid.uid.uidByte[i], HEX);
    }
    rawUid.toUpperCase();

    // Hitung juga UID Desimal Kartu (Mifare 4 Byte)
    unsigned long uidDec = 0;
    for (byte i = 0; i < rfid.uid.size; i++) {
      uidDec = (uidDec << 8) | rfid.uid.uidByte[i];
    }
    String decimalUidStr = String(uidDec);

    String sakHex = String(rfid.uid.sak, HEX);
    if (sakHex.length() < 2) sakHex = "0" + sakHex;
    sakHex.toUpperCase();

    MFRC522::PICC_Type piccType = rfid.PICC_GetType(rfid.uid.sak);
    String typeName = rfid.PICC_GetTypeName(piccType);

    Serial.println("\\n-------------------------------------------");
    Serial.println(">> KARTU DITEMPELKAN!");
    Serial.println("UID Hex     : " + rawUid);
    Serial.println("UID Decimal : " + decimalUidStr);
    Serial.print  ("UID Size    : ");
    Serial.print(rfid.uid.size);
    Serial.println(" byte");
    Serial.println("SAK         : 0x" + sakHex);
    Serial.println("Tipe Kartu  : " + typeName);
    Serial.println("-------------------------------------------");

    // Proteksi cooldown untuk kartu yang sama (mencegah spam terbaca berkali-kali)
    if (decimalUidStr == lastScannedUID && (now - lastScanMillis) < COOLDOWN_SAME_CARD) {
      Serial.println(">> Cooldown: Kartu yang sama baru saja di-tap.");
    } else {
      lastScannedUID = decimalUidStr;
      lastScanMillis = now;

      // LANGSUNG PROSES SISWA INI (Teks lama otomatis terputus!)
      processCardAttendance(decimalUidStr);
    }

    // Selesai transaksi kartu ini pada sensor
    rfid.PICC_HaltA();
    rfid.PCD_StopCrypto1();
    return;
  }

  // --------------------------------------------------------------------------
  // BAGIAN B: LOGIKA TAMPILAN LCD SESUAI STATE (NON-BLOCKING)
  // --------------------------------------------------------------------------

  // STATE 1: SEDANG MENAMPILKAN NAMA SISWA (RUNNING TEXT)
  if (currentState == STATE_DISPLAY_NAME) {
    // Geser teks berjalan setiap interval SCROLL_INTERVAL
    if (now - lastScrollMillis >= SCROLL_INTERVAL) {
      lastScrollMillis = now;
      updateRunningText();
    }

    // Jika waktu tayang sudah habis (4.5 detik) dan tidak ada siswa baru:
    // Kembalikan layar ke mode animasi Standby
    if (now - displayDoneStartMillis >= DISPLAY_HOLD_TIME) {
      currentState = STATE_STANDBY;
      idleFrame = 0;

      // Bersihkan nama/status siswa sebelum menggambar wajah standby.
      // Clear hanya saat pergantian state, bukan setiap frame animasi.
      lcd.clear();
      drawIdleFace(idleFrame);
      resetRobotSpeech();
      lastIdleAnimMillis = now;
    }
  }

  // STATE 2: MODE STANDBY (EKSPRESI MATA ACAK + SAPAAN)
  else if (currentState == STATE_STANDBY) {
    // Dialog robot berjalan independen dari animasi mata.
    updateRobotSpeech(now);

    // Pilih ekspresi secara acak agar robot terasa lebih hidup.
    // Kedipan singkat; ekspresi lain ditahan lebih lama.
    static unsigned long expressionDuration = 1200;
    if (now - lastIdleAnimMillis >= expressionDuration) {
      int nextExpression;
      do {
        nextExpression = random(0, 9); // 0..8: netral, lirikan, blink, sleepy, surprise, wink
      } while (nextExpression == idleFrame);

      idleFrame = nextExpression;
      drawIdleFace(idleFrame);
      lastIdleAnimMillis = now;

      if (idleFrame == 3 || idleFrame == 6 || idleFrame == 7) {
        expressionDuration = random(180, 301);
      } else {
        expressionDuration = random(750, 1901);
      }
    }
  }
}
