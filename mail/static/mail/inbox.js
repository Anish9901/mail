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
  
  const form = document.querySelector('#compose-form')
  form.addEventListener('submit', (event) => {
    event.preventDefault()
    //console.log(event);
    submit_form();
    load_mailbox('sent')
  });
}

function submit_form() {
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value
  // console.log(recipients, subject, body);
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
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
  .then(response => response.json())
  emails.forEach(email => {
    console.log(email);
    const element = document.createElement('div');
    element.innerHTML = `<div class="card-body table-hover"><h5 class="card-title">${email["sender"]}</h5> <h6 class="card-text">${email["subject"]}</h6> <p class="card-text">${email["body"]}</p> <a href="#" class="stretched-link"></a> </div>`;
    element.className = "card my-3";
    element.addEventListener('click', () => load_email(email["id"]))
    document.querySelector('#emails-view').append(element);
  });
}

async function load_email(email_id) {
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
  });
}
