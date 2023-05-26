
document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  // Email form 
  document.querySelector('#compose-form').addEventListener('submit', send);
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
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // GET method (getting all emails):
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {

      emails.forEach(email => {
        const element = document.createElement('div');
        element.className = "container text-center list-group";
        // Background color for read/unread email
        if (email.read === true){
          style = "background-color: #CCCCCC;"
        }
        else{
          style= " background-color: white;"
        }
        element.innerHTML = `
        <li class="list-group-item mb-1" style="${style}; border: 2px solid #0d6efd; cursor: pointer;">
          <div class="row" id="${email.id}">
              <div class="col fw-bolder text-start">
                ${email.sender}
              </div>
              <div class="col text-start">
              ${email.subject}
              </div>
              <div class="col fw-lighter">
              ${email.timestamp}
              </div>
          </div>
        </li>
        `;
        // Displaying the one email: 
        element.addEventListener('click', function() {
          document.querySelectorAll('li').forEach(li => {
            li.style.display = 'none';
          })
          showEmail(email.id)
        });
        document.querySelector('#emails-view').append(element);
        // 

     });

  });
}

function send(event){
  
  event.preventDefault();
  
  // Taking the values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject =document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;
  // POST method (sending the email):
  fetch(`/emails`, {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      // Print result
      console.log(result);
      // Transfering to the INBOX 
      load_mailbox('sent');
  });
}

function showEmail(id) {
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      const div = document.createElement('div');
      div.className = "container text-center list-group";
      div.innerHTML = `
        <hr>
        <div class="text-start"><strong>From:</strong> ${email.sender}</div>
        <div class="text-start"><strong>To:</strong> ${email.recipients}</div>
        <div class="text-start"><strong>Subject:</strong> ${email.subject}</div>
        <div class="text-start mb-5"><strong>Timestamp:</strong> ${email.timestamp}</div>
        <div class="text-start"><button class="btn btn-primary" id="replay" type="submit">Replay</button>
        <hr>
        <p><strong>Body:</strong></div>
        <div class="text-start mb-5">${email.body}</div>
      `;
      // Read (When a user clicks on an email, the read state is changed automatically):
      document.querySelector('#emails-view').append(div);
      if(email.read === false){
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
              read: true
          })
        })
      }
      // Archive and Unarchive:
      const button = document.createElement('button');
      if (email.archived === false){
        button.innerHTML = 'Archive';
        button.className = "btn btn-success";
        state = true;
      }
      else {
        button.innerHTML = 'Unarchive';
        button.className = "btn btn-danger";
        state = false;
      }
      
      button.addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: state
            })
          })
          .then(() => { load_mailbox('inbox') })
      });
      document.querySelector('#emails-view').append(button);
      // Replay
      document.querySelector('#replay').addEventListener('click', function(){
        compose_email()
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: ${email.body}`;
      })
  });
  
}