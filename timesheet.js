document.getElementById("app").innerHTML = `
<h2>Weekly Timesheet</h2>

<input id="client" placeholder="Client">
<input id="project" placeholder="Project">

<select id="resource">
 <option>Internal</option>
 <option>External</option>
</select>

<select id="billing">
 <option>Billable</option>
 <option>Non-Billable</option>
</select>

<textarea id="desc" placeholder="Work Description"></textarea>

<input id="mon" type="number" placeholder="Monday">
<input id="tue" type="number" placeholder="Tuesday">
<input id="wed" type="number" placeholder="Wednesday">
<input id="thu" type="number" placeholder="Thursday">
<input id="fri" type="number" placeholder="Friday">

<input id="total" readonly placeholder="Total">
<button onclick="save()">Submit</button>
`;

// Auto calculate total
["mon","tue","wed","thu","fri"].forEach(id=>{
 document.getElementById(id).addEventListener("input",()=>{
  total.value =
    (+mon.value || 0) +
    (+tue.value || 0) +
    (+wed.value || 0) +
    (+thu.value || 0) +
    (+fri.value || 0);
 });
});


// Get SharePoint Form Digest
function getDigest(){
  return fetch("https://enoah.sharepoint.com/_api/contextinfo", {
    method: "POST",
    headers: {
      "Accept": "application/json;odata=verbose"
    },
    credentials: "include"     // VERY IMPORTANT
  })
  .then(r => r.json())
  .then(d => d.d.GetContextWebInformation.FormDigestValue);
}


// Save to SharePoint list
function save(){
  getDigest().then(digest => {
    fetch("https://enoah.sharepoint.com/_api/web/lists/getbytitle('Timesheet_GridData')/items", {
      method: "POST",
      credentials: "include",     // VERY IMPORTANT
      headers: {
        "Accept": "application/json;odata=verbose",
        "Content-Type": "application/json;odata=verbose",
        "X-RequestDigest": digest
      },
      body: JSON.stringify({
        "__metadata": { "type": "SP.Data.Timesheet_x005f_GridDataListItem" },
        "Client": client.value,
        "Project": project.value,
        "ResourceType": resource.value,
        "BillingType": billing.value,
        "WorkDescription": desc.value,
        "Monday": mon.value,
        "Tuesday": tue.value,
        "Wednesday": wed.value,
        "Thursday": thu.value,
        "Friday": fri.value,
        "Total": total.value
      })
    })
    .then(res => {
      if(!res.ok) throw "Error saving data";
      alert("Saved in SharePoint!");
    })
    .catch(err => alert("Error: " + err));
  });
}
