document.addEventListener('DOMContentLoaded', function() {
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';

  const form = document.querySelector('#compose-form');
  form.addEventListener('submit', handle_submit);
}

async function handle_submit(event) {
  event.preventDefault();
  await submit_form();
  await load_mailbox('sent');
}

async function submit_form() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  await fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
      read: false
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
  })
}

async function load_mailbox(mailbox) {  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  
  // Show email cards
  const emails = await fetch('/emails/' + mailbox)
  .then(response => response.json());

  emails.forEach(email => {
    const element = document.createElement('div');
    element.innerHTML = `
    <div class="card-body table-hover">
      <h5 class="card-title">${email["sender"]}</h5>
      <h6 class="card-text">${email["subject"]}</h6>
      <p class="card-text">${email["body"].length > 256 ? email["body"].slice(0, 256) + "..." : email["body"]}</p>
    </div>`;
    element.className = "card my-3";
    element.style.backgroundColor = email["read"] ? "#b7f2af" : element.style.backgroundColor;
    document.querySelector('#emails-view').append(element);
    element.addEventListener('click', () => load_email(email["id"], mailbox))
  });
}

async function load_email(email_id, mailbox) {
  const email_json = await fetch(`/emails/${email_id}`)
  .then(response => response.json());
  console.log(email_json);

  document.querySelector('#emails-view').innerHTML = `
  <h3> ${email_json["subject"]} </h3>
  <p> <b> From: </b> ${email_json["sender"]}
  <br>
  <b> To: </b> ${email_json["recipients"]}
  <br>
  <b> Date: </b> ${email_json["timestamp"]}
  <br>
  <b> Subject: </b> ${email_json["subject"]} </p>
  <br>
  <p> ${email_json["body"]} </p>
  `;

  if (mailbox !== 'sent') {
    const archive_btn_html = `<button class="btn btn-primary float-right" id="archive-btn">Archive</button>`
    document.querySelector('#emails-view').innerHTML = archive_btn_html + document.querySelector('#emails-view').innerHTML;
    const archive_btn = document.querySelector('#archive-btn');
    if (email_json['archived'] === true) {
      archive_btn.innerHTML = 'Unarchive';
    }
    archive_btn.addEventListener('click', () => archive_email(email_id, email_json['archived']));
  }

  // Mark the email as read once they are opened
  fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
}

async function archive_email(email_id, current_state) {
  await fetch(`/emails/${email_id}`, {
    method: 'PUT',
    body: JSON.stringify({
      archived: !current_state
    })
  })
  await load_mailbox('inbox');
}
