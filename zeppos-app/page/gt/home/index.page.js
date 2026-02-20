import * as hmUI from "@zos/ui";
import { Geolocation } from "@zos/sensor";
import { getDeviceInfo } from "@zos/device";
import { px } from "@zos/utils";
import { Time } from "@zos/sensor";

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo();

Page({
  state: {
    lat: 0,
    lon: 0,
    accuracy: 0,
    inputCode: "",
    gpsReady: false,
    userName: "",
    lastScanTime: 0,
    groupGPS: null,
    groupInput: null,
    groupDashboard: null,
    txtInput: null,
    checkedIn: false,
    groupQR: null,
    qrWidget: null,
    btnCheckIn: null,
    btnShowQR: null,
    checkInDate: "",
    checkInTime: ""
  },

  onInit() {
    console.log("OnInit");
    hmUI.setStatusBarVisible(false);
  },

  build() {
    // 1. GPS Screen
    this.createGPSScreen();

    // 2. Input Screen
    this.createInputScreen();

    // 3. Dashboard Screen
    this.createDashboardScreen();

    // 4. QR Screen
    this.createQRScreen();

    // Initial State: GPS Scanning
    this.showScreen("GPS");
    this.startGPS();
  },

  onDestroy() {
    if (this.geolocation) {
      this.geolocation.stop();
    }
    if (this.state.timer) {
      clearInterval(this.state.timer);
    }
  },

  createGPSScreen() {
    this.state.groupGPS = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT
    });

    this.state.groupGPS.createWidget(hmUI.widget.TEXT, {
      x: px(25),
      y: 0,
      w: DEVICE_WIDTH - px(50),
      h: DEVICE_HEIGHT,
      text: "Scanning GPS...\nPlease go outdoors.",
      text_size: px(30),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });
  },

  createInputScreen() {
    this.state.groupInput = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT
    });

    // Input Display
    this.state.txtInput = this.state.groupInput.createWidget(hmUI.widget.TEXT, {
      x: px(25),
      y: px(20),
      w: DEVICE_WIDTH - px(50),
      h: px(50),
      text: "Enter Code",
      text_size: px(32),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H,
    });

    // Keypad Layout
    const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "DEL", "0", "OK"];
    const startY = px(80);
    const margin = px(25);
    const gap = px(10);
    const btnW = (DEVICE_WIDTH - margin * 2 - gap * 2) / 3;
    const btnH = px(60);

    keys.forEach((key, index) => {
      const row = Math.floor(index / 3);
      const col = index % 3;

      this.state.groupInput.createWidget(hmUI.widget.BUTTON, {
        x: margin + col * (btnW + gap),
        y: startY + row * btnH,
        w: btnW,
        h: btnH - px(4),
        text: key,
        color: 0x000000,
        normal_color: 0xffffff,
        press_color: 0xe0e0e0,
        radius: px(12),
        click_func: () => {
          this.handleInput(key);
        }
      });
    });
  },

  createQRScreen() {
    this.state.groupQR = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT
    });

    const bgSize = px(300);
    this.state.groupQR.createWidget(hmUI.widget.FILL_RECT, {
      x: (DEVICE_WIDTH - bgSize) / 2,
      y: px(30),
      w: bgSize,
      h: bgSize,
      color: 0xffffff,
      radius: px(20)
    });

    const qrSize = px(260);
    // Initial placeholder, will be recreated in generateQR
    this.state.qrWidget = this.state.groupQR.createWidget(hmUI.widget.QR_CODE, {
      x: (DEVICE_WIDTH - qrSize) / 2,
      y: px(50),
      w: qrSize,
      h: qrSize,
      content: "0"
    });

    this.state.groupQR.createWidget(hmUI.widget.BUTTON, {
      x: px(80),
      y: DEVICE_HEIGHT - px(80),
      w: DEVICE_WIDTH - px(160),
      h: px(60),
      text: "BACK",
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(30),
      click_func: () => {
        this.showScreen("DASHBOARD");
      }
    });
  },

  createDashboardScreen() {
    this.state.groupDashboard = hmUI.createWidget(hmUI.widget.GROUP, {
      x: 0, y: 0, w: DEVICE_WIDTH, h: DEVICE_HEIGHT
    });

    const labelX = px(25);
    const startY = px(20);

    this.state.lblTime = this.state.groupDashboard.createWidget(hmUI.widget.TEXT, {
      x: labelX, y: startY, w: DEVICE_WIDTH - labelX * 2, h: px(35),
      text: "--:--:--",
      text_size: px(26),
      color: 0xffffff,
      align_h: hmUI.align.CENTER_H
    });

    this.state.lblDate = this.state.groupDashboard.createWidget(hmUI.widget.TEXT, {
      x: labelX, y: startY + px(35), w: DEVICE_WIDTH - labelX * 2, h: px(35),
      text: "--/--/----",
      text_size: px(26),
      color: 0xcccccc,
      align_h: hmUI.align.CENTER_H
    });

    const infoY = startY + px(80);
    const gap = px(35);

    this.state.lblName = this.state.groupDashboard.createWidget(hmUI.widget.TEXT, {
      x: labelX, y: infoY, w: DEVICE_WIDTH - labelX * 2, h: px(35),
      text: "User: -",
      text_size: px(26),
      color: 0xffffff,
      align_h: hmUI.align.LEFT
    });

    this.state.lblLat = this.state.groupDashboard.createWidget(hmUI.widget.TEXT, {
      x: labelX, y: infoY + gap, w: DEVICE_WIDTH - labelX * 2, h: px(35),
      text: "Latitude: -",
      text_size: px(26),
      color: 0xffffff,
      align_h: hmUI.align.LEFT
    });

    this.state.lblLon = this.state.groupDashboard.createWidget(hmUI.widget.TEXT, {
      x: labelX, y: infoY + gap * 2, w: DEVICE_WIDTH - labelX * 2, h: px(35),
      text: "Longitude: -",
      text_size: px(26),
      color: 0xffffff,
      align_h: hmUI.align.LEFT
    });

    const btnMargin = px(25);
    const btnGap = px(15);
    const btnWidth = (DEVICE_WIDTH - btnMargin * 2 - btnGap) / 2;
    const btnY = infoY + gap * 3.5;

    // 1. Check In Button (Initially Visible)
    this.state.btnCheckIn = this.state.groupDashboard.createWidget(hmUI.widget.BUTTON, {
      x: btnMargin,
      y: btnY,
      w: btnWidth,
      h: px(60),
      text: "CHECK IN",
      color: 0x000000,
      normal_color: 0xffffff,
      press_color: 0xe0e0e0,
      radius: px(12),
      click_func: () => {
        this.performCheck("IN");
      }
    });

    // 2. Show QR Button (Initially Hidden, Positioned Below)
    this.state.btnShowQR = this.state.groupDashboard.createWidget(hmUI.widget.BUTTON, {
      x: btnMargin,
      y: btnY + px(75),
      w: btnWidth,
      h: px(60),
      text: "SHOW QR",
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(12),
      visible: false,
      click_func: () => {
        this.generateQR();
      }
    });

    // 3. Check Out Button (Always Visible)
    this.state.groupDashboard.createWidget(hmUI.widget.BUTTON, {
      x: btnMargin + btnWidth + btnGap,
      y: btnY,
      w: btnWidth,
      h: px(60),
      text: "CHECK OUT",
      color: 0x000000,
      normal_color: 0xffffff,
      press_color: 0xe0e0e0,
      radius: px(12),
      click_func: () => {
        this.performCheck("OUT");
        this.state.checkedIn = false;
        // Hide only the auxiliary QR button
        if (this.state.btnShowQR) this.state.btnShowQR.setProperty(hmUI.prop.VISIBLE, false);
      }
    });

    // Start Timer
    this.updateTime();
    this.state.timer = setInterval(() => {
      this.updateTime();
    }, 1000);
  },

  updateTime() {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    const s = now.getSeconds().toString().padStart(2, '0');
    const timeStr = `${h}:${m}:${s}`;

    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const year = now.getFullYear();
    const dateStr = `${day}/${month}/${year}`;

    if (this.state.lblTime) this.state.lblTime.setProperty(hmUI.prop.TEXT, timeStr);
    if (this.state.lblDate) this.state.lblDate.setProperty(hmUI.prop.TEXT, dateStr);
  },

  showScreen(name) {
    this.state.groupGPS.setProperty(hmUI.prop.VISIBLE, name === "GPS");
    this.state.groupInput.setProperty(hmUI.prop.VISIBLE, name === "INPUT");
    this.state.groupDashboard.setProperty(hmUI.prop.VISIBLE, name === "DASHBOARD");
    this.state.groupQR.setProperty(hmUI.prop.VISIBLE, name === "QR");
  },

  startGPS() {
    this.geolocation = new Geolocation();
    this.geolocation.start();

    this.geolocation.onChange = (result) => {
      if (result && result.latitude && result.longitude) {
        this.state.lat = result.latitude;
        this.state.lon = result.longitude;
        console.log("GPS Found", this.state.lat, this.state.lon);
        this.showScreen("INPUT");
        this.geolocation.stop();
        this.geolocation = null;
      }
    };

    setTimeout(() => {
      if (!this.state.lat) {
        hmUI.showToast({ text: "No GPS signal, using mock." });
        this.state.lat = -6.2088;
        this.state.lon = 106.8456;
        this.showScreen("INPUT");
        if (this.geolocation) {
          this.geolocation.stop();
          this.geolocation = null;
        }
      }
    }, 5000);
  },

  handleInput(key) {
    if (key === "DEL") {
      this.state.inputCode = this.state.inputCode.slice(0, -1);
    } else if (key === "OK") {
      this.validateCode();
    } else {
      if (this.state.inputCode.length < 5) {
        this.state.inputCode += key;
      }
    }
    this.state.txtInput.setProperty(hmUI.prop.TEXT, this.state.inputCode);
  },

  validateCode() {
    if (this.state.inputCode === "12345") {
      this.state.userName = "Deni";
      this.state.lblName.setProperty(hmUI.prop.TEXT, "User: " + this.state.userName);
      this.state.lblLat.setProperty(hmUI.prop.TEXT, "Latitude: " + this.state.lat.toFixed(5));
      this.state.lblLon.setProperty(hmUI.prop.TEXT, "Longitude: " + this.state.lon.toFixed(5));
      this.showScreen("DASHBOARD");
    } else {
      hmUI.showToast({ text: "Invalid Code" });
      this.state.inputCode = "";
      this.state.txtInput.setProperty(hmUI.prop.TEXT, "");
    }
  },

  performCheck(type) {
    const now = new Date();
    const hour = now.getHours();

    if (hour < 8 || hour >= 17) {
      hmUI.showToast({ text: "Outside Shift Hours (08-17)" });
      return;
    }

    if (this.state.lat === 0 && this.state.lon === 0) {
      hmUI.showToast({ text: "GPS Invalid" });
      return;
    }

    console.log("Connecting for " + type);

    setTimeout(() => {
      console.log("Success: " + type);
      const resNow = new Date();
      const h = resNow.getHours().toString().padStart(2, '0');
      const m = resNow.getMinutes().toString().padStart(2, '0');
      const s = resNow.getSeconds().toString().padStart(2, '0');
      const resTime = `${h}:${m}:${s}`;

      const day = resNow.getDate().toString().padStart(2, '0');
      const month = (resNow.getMonth() + 1).toString().padStart(2, '0');
      const year = resNow.getFullYear();
      const resDate = `${day}/${month}/${year}`;

      if (type === "IN") {
        this.state.checkedIn = true;
        this.state.checkInTime = resTime;
        this.state.checkInDate = resDate;
        // Keep Check In visible, just show the additional QR button below
        if (this.state.btnShowQR) this.state.btnShowQR.setProperty(hmUI.prop.VISIBLE, true);
      }
    }, 500);
  },

  generateQR() {
    const coords = `${this.state.lon.toFixed(5)},${this.state.lat.toFixed(5)}`;
    const content = `${this.state.checkInTime},${this.state.checkInDate},${this.state.inputCode},${this.state.userName},${coords}`;

    console.log("Showing QR...");
    this.showScreen("QR");

    // Fix: Re-create widget for reliability
    if (this.state.qrWidget) {
      hmUI.deleteWidget(this.state.qrWidget);
    }

    const qrSize = px(260);
    this.state.qrWidget = this.state.groupQR.createWidget(hmUI.widget.QR_CODE, {
      x: (DEVICE_WIDTH - qrSize) / 2,
      y: px(50),
      w: qrSize,
      h: qrSize,
      content: content
    });
  }
});
