document.addEventListener("DOMContentLoaded", function() {
    const tableBody = document.querySelector("#dataTable tbody");
    const recordButton = document.getElementById("recordButton");
    let mediaRecorder;
    let chunks = [];
  
    // Create a SpeechRecognition object
    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition || window.mozSpeechRecognition || window.msSpeechRecognition)();
    recognition.lang = 'en-US';
  
    // Start speech recognition when the user clicks the record button
    recordButton.addEventListener("click", function() {
      startRecording();
    });
  
    // Function to start recording
    function startRecording() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("getUserMedia is not supported in your browser.");
        return;
      }
  
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function(stream) {
          mediaRecorder = new MediaRecorder(stream);
  
          mediaRecorder.ondataavailable = function(event) {
            chunks.push(event.data);
          };
  
          mediaRecorder.onstop = function() {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const audioUrl = URL.createObjectURL(blob);
            recognizeSpeech(audioUrl);
          };
  
          mediaRecorder.start();
          recordButton.textContent = "Stop Recording";
          recordButton.disabled = true;
        })
        .catch(function(error) {
          console.error("Error accessing microphone:", error);
        });
    }
  
    // Function to stop recording
    function stopRecording() {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        recordButton.textContent = "Record";
        recordButton.disabled = false;
        chunks = [];
      }
    }
  
    // Process the recognized speech
    recognition.addEventListener("result", function(event) {
      const transcript = event.results[0][0].transcript;
      const extractedDetails = extractDetails(transcript);
      addToTable(extractedDetails);
    });
  
    // Function to extract the required details from the sentence
    function extractDetails(sentence) {
      const details = {
        quantity: null,
        material: null,
        price: null
      };
  
      const regex = /(\d+)\s*(kg|kgs|kilogram)\s*of\s*(\w+)\s*of\s*rupees\s*(\d+)/i;
      const match = sentence.match(regex);
  
      if (match) {
        details.quantity = match[1];
        details.material = match[3];
        details.price = match[4];
      }
  
      return details;
    }
  
    // Function to add the details to the table
    function addToTable(details) {
      const newRow = document.createElement("tr");
      const quantityCell = document.createElement("td");
      const materialCell = document.createElement("td");
      const priceCell = document.createElement("td");
  
      quantityCell.textContent = details.quantity || "";
      materialCell.textContent = details.material || "";
      priceCell.textContent = details.price || "";
  
      newRow.appendChild(quantityCell);
      newRow.appendChild(materialCell);
      newRow.appendChild(priceCell);
  
      tableBody.appendChild(newRow);
    }
  
    // Function to recognize speech from an audio URL
    function recognizeSpeech(audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play();
  
      audio.addEventListener("ended", function() {
        recognition.start();
        recordButton.textContent = "Record";
        recordButton.disabled = false;
      });
    }
  
    // Stop recording if the window is closed or refreshed
    window.addEventListener("beforeunload", function() {
      stopRecording();
    });
  });
  