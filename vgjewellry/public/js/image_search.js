// Text search
document.getElementById("search-btn").addEventListener("click", async () => {
  const query = document.getElementById("query").value.trim();
  if (!query) return alert("Enter a search term");

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Searching...</p>";
  
   const body = new URLSearchParams();
  body.append("query", query);
  var branch=document.getElementById("branch").value.trim();
  if (branch) body.append("branch", branch);
  var item=document.getElementById("item").value.trim();
  if (item) body.append("item", item);

  const response = await fetch("http://192.168.1.63:8000/search", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    //body: `query=${encodeURIComponent(query)}`
	body: body.toString()
  });

  const results = await response.json();
  displayResults(results);
});

// Image search
document.getElementById("image-search-btn").addEventListener("click", async () => {
  const fileInput = document.getElementById("image-upload");
  if (fileInput.files.length === 0) return alert("Select an image first");

  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append("image", file);
  
  var branch=document.getElementById("branch").value.trim();
  if (branch) formData.append("branch", branch);
  var item=document.getElementById("item").value.trim();
  if (item) formData.append("item", item);
  
  

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "<p>Searching...</p>";

  const response = await fetch("http://localhost:8000/search", {
    method: "POST",
    body: formData
  });

  const results = await response.json();
  displayResults(results);
});

// Display results
function displayResults(results) {
  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  if (results.length === 0) {
    resultsDiv.innerHTML = "<p>No results found.</p>";
    return;
  }

  results.forEach(r => {
    const div = document.createElement("div");
	
    div.className = "result";
    div.innerHTML = `
      <img src="${r.path}" alt="${r.path}">
      <div class="score">${r.score.toFixed(3)}</div>
	  <div class="score">Branch:${r.db_lookup.Branch}</div>
	  <div class="score">Item:${r.db_lookup.Item}</div>
	  <div class="score">Lable No:${r.db_lookup.LabelNo}</div>
	  <div class="score">Net Wt:${r.db_lookup.NetWt}</div>
	  <div class="score">Gross Wt:${r.db_lookup.GrossWt}</div>
	  <div class="score">Status:${r.db_lookup.Status}</div>
    `;
    resultsDiv.appendChild(div);
  });
}

const input = document.getElementById('image-upload');
  const img   = document.getElementById('preview');
  const meta  = document.getElementById('meta');
  let currentURL; // to revoke object URLs

  input.addEventListener('change', () => {
    const file = input.files && input.files[0];
    if (!file) return;

    // Clean up previous object URL if any
    if (currentURL) URL.revokeObjectURL(currentURL);

    // Quick preview
    currentURL = URL.createObjectURL(file);
    img.src = currentURL;
    img.style.display = 'inline-block';

    // Show basic info (optional)
    //meta.textContent = `${file.name} — ${(file.size/1024).toFixed(1)} KB`;

    // Once the image loads, we can read its dimensions
    img.onload = () => {
      //meta.textContent += ` — ${img.naturalWidth}×${img.naturalHeight}px`;
    };
  });


async function loadInitial() {
  const res = await fetch("http://192.168.1.63:8000/initial");
  const { branches = [], items = [] } = await res.json();

  fillSelect("branch", branches);
  fillSelect("item", items);
}

function fillSelect(id, values) {
  const sel = document.getElementById(id);
  while (sel.options.length > 1) sel.remove(1); // keep "All"
  values.forEach(v => {
    const opt = document.createElement("option");
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

// Call on page load
window.addEventListener("DOMContentLoaded", loadInitial);

