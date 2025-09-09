const axios = require("axios");

(async function() {
    const response = await axios.post("https://v3.api.termii.com/api/sms/send", {
        api_key: "TLlbriAhjKwgxgouISYSlTzEiWiHaWsVdjToMPEsrRXqJHoglBXhEPRkUnoEkE",
        to: "2348137249484",
        from: "N-Alert",
        sms: `Hello Victor, here is your test`,
        type: "plain",
        channel: "dnd"
      });

      console.log(response.data);

})();
