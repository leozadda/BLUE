// Import required modules
const express = require('express');
const { Readable } = require('stream'); // Used for stream operations
const router = express.Router();

// POST endpoint to handle chat requests
router.post('/', async (req, res) => {
  console.log('Received chat request from client.');
  try {
    // Extract the 'question' from the request body.
    const { question } = req.body;
    if (!question) {
      console.error("Error: 'question' field is missing in the request body.");
      return res.status(400).json({ error: "Missing 'question' field" });
    }

    // Make a POST request to the external AI API.
    console.log('Forwarding question to external AI API:', question);
    const response = await fetch("https://api.awanllm.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.AWANLLM_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "Meta-Llama-3.1-8B-Instruct",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: question }
        ],
        stream: true, // Enable streaming response
        // ... other parameters if needed
      })
    });

    // If the external API did not return a success status, pass the error back.
    if (!response.ok) {
      const errorText = await response.text();
      console.error('External API error:', errorText);
      return res.status(response.status).json({ error: errorText });
    }

    // Set the response header to indicate that the data is streamed as newline-delimited JSON.
    res.setHeader('Content-Type', 'application/x-ndjson');
    // Immediately flush headers so that the client starts receiving data.
    res.flushHeaders();

    console.log('Starting to stream response to client...');
    const decoder = new TextDecoder();
    let buffer = '';

    // Read from the external API response stream chunk by chunk.
    for await (const chunk of response.body) {
      // Decode the current chunk.
      buffer += decoder.decode(chunk, { stream: true });
      console.log('Received chunk from external API:', chunk);

      // Process complete lines in the buffer.
      while (true) {
        const newlineIndex = buffer.indexOf('\n');
        if (newlineIndex === -1) break; // No complete line yet

        // Extract a complete line and remove it from the buffer.
        const line = buffer.slice(0, newlineIndex).trim();
        buffer = buffer.slice(newlineIndex + 1);

        // We expect lines starting with "data:" (NDJSON format)
        if (!line.startsWith('data:')) continue;

        // Remove the "data:" prefix and trim the line.
        const jsonStr = line.slice(5).trim();
        // Check for the end-of-stream marker.
        if (jsonStr === '[DONE]') {
          console.log('End-of-stream marker received.');
          break;
        }

        try {
          // Parse the JSON string.
          const data = JSON.parse(jsonStr);
          console.log('Parsed data chunk:', data);
          // If the API provided content in this chunk, send it to the client.
          if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
            const contentChunk = data.choices[0].delta.content;
            // Write the content chunk as a JSON object followed by a newline.
            res.write(JSON.stringify({ content: contentChunk }) + '\n');
          }
        } catch (err) {
          console.error('Parse error in streaming data:', err);
        }
      }
    }

    // If there is any remaining text in the buffer, try to process it.
    if (buffer.trim()) {
      try {
        const data = JSON.parse(buffer.slice(5).trim());
        if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
          res.write(JSON.stringify({ content: data.choices[0].delta.content }) + '\n');
        }
      } catch (err) {
        console.error('Error processing final buffer chunk:', err);
      }
    }

    // End the response after streaming is complete.
    res.end();
    console.log('Finished streaming response to client.');
  } catch (error) {
    // Log any unexpected errors and return a 500 status.
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Export the router so it can be used in your Express app.
module.exports = router;
