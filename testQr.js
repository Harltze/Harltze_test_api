const QRCode = require("qrcode");

const generateQR = async text => {
  try {
    return {
      result: await QRCode.toDataURL(text),
      error: null
    }
  } catch (error) {
    return {
      result: null,
      error
    };
  }
}

