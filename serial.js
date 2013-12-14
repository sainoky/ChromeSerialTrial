$(function () {
  var open = false;
  init();

  function init() {
    chrome.serial.getPorts(function (ports) {
      for (var i = 0; i < ports.length; i++) {
        var port = ports[i];
        $("#ports").append($("<option>").html(port).val(port));
      }
    });
  }

  $("#open").click(function () {
    var selectedPort = $("#ports option:selected").val();
    console.log("selectedPort=" + selectedPort);
    var options = {bitrate:115200};
    chrome.serial.open(selectedPort, options, function (openInfo) {
      connectionId = openInfo.connectionId;
      console.log("openInfo.connectionId=" + connectionId);
      open = true;
      readPort();
    });
  });

  $("#close").click(function () {
    chrome.serial.close(connectionId, function () {
      open = false;
      console.log("Closed.");
    });
  });

  $("#write").click(function () {
    writePort();
  });

  function writePort() {
    var str = document.getElementById('textIn').value;
    appendStr(str);

    var ab = str2ab(str);
    chrome.serial.write(connectionId, ab,
        function (sendInfo) {console.log("Sent:" + str)})
  }

  function readPort() {
    var bytesToRead= 64;
    chrome.serial.read(connectionId, bytesToRead,
        function (readInfo) {
          if (readInfo.bytesRead > 0) {
            var str = ab2str(readInfo.data);
            console.log("Received:" + str);
            appendStr(str);
          }
          if (open) {
            readPort();
          }
        });
  }

  function appendStr(str) {
    var allstr = document.getElementById('textOut').value + str + '\n';
    document.getElementById('textOut').value = allstr;
  }

  function ab2str(buf) {
    var bufView = new Uint8Array(buf);
    var encodedString = String.fromCharCode.apply(null, bufView);
    return decodeURIComponent(escape(encodedString));
  };

  function str2ab(str) {
    var encodedString = unescape(encodeURIComponent(str));
    var bytes = new Uint8Array(encodedString.length);
    for (var i = 0; i < encodedString.length; ++i) {
      bytes[i] = encodedString.charCodeAt(i);
    }
    return bytes.buffer;
  };
});

