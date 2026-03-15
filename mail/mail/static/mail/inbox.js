// Functions accessible globally
function compose_email() {
  emailView.style.display = "none";
  composeView.style.display = "block";

  document.querySelector("#compose-recipients").value = "";
  document.querySelector("#compose-subject").value = "";
  document.querySelector("#compose-body").value = "";
}

function load_mailbox(mailbox) {
  document.querySelector("#emails-view").style.display = "block";
  document.querySelector("#compose-view").style.display = "none";
  moreDetailedEmailView.style.display = "none";
  update_button_classes("#inbox");

  document.querySelector("#emails-view").innerHTML = `<h3 class="py-3 px-1">
  ${
    // Icon changing for each mailbox view
    mailbox === "inbox"
      ? '<i class="fa-solid fa-inbox me-3"></i>'
      : mailbox === "sent"
      ? '<i class="fa-regular fa-paper-plane me-2"></i>'
      : mailbox === "archive"
      ? '<i class="fa-solid fa-box-archive me-2"></i>'
      : ""
  }${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}
</h3>`;

  fetch(`/emails/${mailbox}`)
    .then((response) => response.json())
    .then((emails) => {
      emails.forEach((email) => {
        const emailDiv = document.createElement("div");
        emailDiv.className = `card mb-2 rounded-4`;
        emailDiv.style.cursor = "pointer";
        emailDiv.id = "mail-cards";

        // Parse the email timestamp
        const emailDate = new Date(email.timestamp);
        emailDate.setHours(emailDate.getHours() + 3);

        const currentDate = new Date();

        // Format the timestamp
        let formattedTimestamp;

        if (
          emailDate.getDate() === currentDate.getDate() &&
          emailDate.getMonth() === currentDate.getMonth() &&
          emailDate.getFullYear() === currentDate.getFullYear()
        ) {
          // If the email is received today, show only the time
          formattedTimestamp = emailDate.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        } else {
          // Otherwise, show the day, date, and month
          formattedTimestamp = emailDate.toLocaleDateString([], {
            weekday: "short", // Day of the week
            year: "numeric", // Full year
            month: "short", // Abbreviated month
            day: "numeric", // Day of the month
          });
        }

        // Change the display based on mailbox type
        const emailSenderOrRecipient =
          mailbox === "sent" ? email.recipients.join(", ") : email.sender;

        emailDiv.innerHTML = `
          <div class="card-body d-flex flex-wrap justify-content-between align-items-start">
            <div>
              <h5 class="card-title fw-bold fs-5">
                ${
                  email.read
                    ? ""
                    : '<i class="fa-solid fa-circle fa-2xs me-2" style="color:#eb5e28;"></i>'
                }${email.subject}
              </h5>
              <h6 class="card-subtitle fw-bold fs-6 mb-2">-${emailSenderOrRecipient}</h6>
              <p class="card-text text-wrap text-secondary fw-light">
                ${
                  email.body.length > 250
                    ? email.body.slice(0, 250) + "..."
                    : email.body
                }
              </p>
            </div>
            <div class="text-end align-self-end w-100 w-sm-auto mt-2 mt-sm-0">
              <small class="text-body-secondary">${formattedTimestamp}</small>
            </div>
          </div>
        `;

        emailDiv.addEventListener("click", () => view_email(email.id));
        document.querySelector("#emails-view").appendChild(emailDiv);
      });
    });

  update_button_classes(`#${mailbox}`);
}


function view_email(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {

      emailView.style.display = "none";
      composeView.style.display = "none";
      moreDetailedEmailView.style.display = "block";

      // Build detailed email view
      moreDetailedEmailView.innerHTML = `
        <div class="card rounded-4 rounded-top-0 shadow-sm p-4">
          <h3 class="card-title fw-bold mb-3">${email.subject}</h3>
          <div class="d-flex flex-wrap justify-content-between align-items-start mb-2">
            <!-- Sender and Recipient Information -->
            <div>
              <p class="mb-1"><strong>From:</strong> ${email.sender}</p>
              <p class="mb-1"><strong>To:</strong> ${email.recipients.join(", ")}</p>
            </div>

            <!-- Timestamp -->
            <div class="mt-2 mt-sm-0 text-start text-sm-end">
              <small class="text-muted">${email.timestamp}</small>
            </div>
          </div>
          <hr class="m-0 mb-3"/>
          <div class="mb-4">
            <p class="card-text" style="white-space: pre-wrap;">${
              email.body
            }</p>
          </div>
          <div class="d-flex justify-content-end">
            <button class="btn btn-outline-secondary d-flex justify-content-center align-items-center me-2" onclick="load_mailbox('inbox')">
              <i class="fa-solid fa-arrow-left"></i> 
              <span class="d-none d-sm-inline ms-2">Back</span>
            </button>
            ${
              !email.archived
                ? `<button class="btn me-2 text-light d-flex justify-content-center align-items-center" onclick="toggle_archive(${email.id}, true)" style="background-color:#eb5e28;">
                    <i class="fa-solid fa-box-archive"></i> 
                    <span class="d-none d-sm-inline ms-2">Archive</span>
                  </button>`
                : `<button class="btn btn-success me-2 d-flex justify-content-center align-items-center" onclick="toggle_archive(${email.id}, false)">
                    <i class="fa-solid fa-boxes-packing"></i> 
                    <span class="d-none d-sm-inline ms-2">Unarchive</span>
                  </button>`
            }
            <button class="btn btn-primary d-flex justify-content-center align-items-center" onclick="open_reply_modal('${email.id}')">
              <i class="fa-solid fa-reply"></i> 
              <span class="d-none d-sm-inline ms-2">Reply</span>
            </button>
          </div>
        </div>
      `;
    });

  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      read: true,
    }),
  });
}

function toggle_archive(id, archive) {
  fetch(`/emails/${id}`, {
    method: "PUT",
    body: JSON.stringify({
      archived: archive,
    }),
  })
    .then((response) => {
      if (response.ok) {
        load_mailbox("inbox"); // Reload the inbox after archiving/unarchiving
      } else {
        console.error("Failed to update archive state.");
      }
    })
    .catch((error) => console.error("Error:", error));
}

function send_email(event) {
  event.preventDefault();

  const responseContainer = document.getElementById("response-div");
  const response = document.getElementById("response");

  const recepientContent = document.querySelector("#compose-recipients").value;
  const subjectContent = document.querySelector("#compose-subject").value;
  const bodyContent = document.querySelector("#compose-body").value;

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recepientContent,
      subject: subjectContent,
      body: bodyContent,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.error) {
        responseContainer.classList.remove("d-none");
        responseContainer.classList.add("bg-danger", "bg-opacity-50");
        response.innerHTML =
          '<i class="fa-solid fa-circle-exclamation me-2"></i> ' +
          (result.error || "An error occurred");
      } else if (result.message) {
        responseContainer.classList.remove("d-none", "bg-danger");
        responseContainer.classList.add("bg-success", "bg-opacity-50");
        response.innerHTML =
          '<i class="fa-regular fa-circle-check me-2"></i> ' +
          (result.message || "Email sent successfully!");
        setTimeout(() => {
          load_mailbox("sent");
        }, 400);
      }
    })
    .catch((error) => {
      responseContainer.classList.remove("d-none");
      responseContainer.classList.add("bg-danger", "bg-opacity-50");
      response.innerHTML =
        '<i class="fa-solid fa-circle-exclamation me-2"></i> ' +
        "Failed to send email.";
    });
}

function update_button_classes(activeButtonId) {
  const buttonIds = ["#inbox", "#compose", "#sent", "#archived"];

  buttonIds.forEach((buttonId) => {
    const button = document.querySelector(buttonId);
    if (buttonId === activeButtonId) {
      button.classList.remove("btn-outline-light");
      button.classList.add("btn-light");
    } else {
      button.classList.remove("btn-light");
      button.classList.add("btn-outline-light");
    }
  });
}

function open_reply_modal(id) {
  fetch(`/emails/${id}`)
    .then((response) => response.json())
    .then((email) => {
      // Check if sender exists
      if (!email.sender) {
        console.error("Email sender not found!");
        return;
      }

      // Pre-fill the reply form
      const recipientsField = document.querySelector("#reply-recipients");
      const subjectField = document.querySelector("#reply-subject");
      const bodyField = document.querySelector("#reply-body");

      // Set the Sender
      const sender = email.sender;
      recipientsField.value = sender;
      // Set the subject
      const subject = email.subject.startsWith("Re: ")
        ? email.subject
        : `Re: ${email.subject}`;
      subjectField.value = subject;

      // Format the body with a separator line and quoted email content
      const separator =
        "\n--------------------------------------------------------------------------\n";
      const quotedContent = `On ${email.timestamp}, ${email.sender} wrote:\n${email.body}`;
      bodyField.value = `\n\n${separator}${quotedContent}`;

      // Move the cursor to the start of the body (above the quoted content)
      bodyField.setSelectionRange(0, 0); // Place the cursor at the start
      bodyField.focus(); // Ensure the field is focused

      // Show the modal
      const replyModal = new bootstrap.Modal(
        document.getElementById("replyModal")
      );
      replyModal.show();
    })
    .catch((error) => {
      console.error("Failed to fetch email for reply:", error);
    });
}

function send_reply() {
  const recipients = document.querySelector("#reply-recipients").value.trim(); // Trim whitespace
  const subject = document.querySelector("#reply-subject").value.trim();
  const body = document.querySelector("#reply-body").value.trim();

  if (!recipients) {
    alert("Recipient is required to send the email.");
    return;
  }

  fetch("/emails", {
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body,
    }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.message) {

        // Hide the modal and reload the sent mailbox
        const replyModal = bootstrap.Modal.getInstance(
          document.getElementById("replyModal")
        );
        replyModal.hide();
        load_mailbox("sent");
      } else if (result.error) {
        console.error("Failed to send email:", result.error);
        alert(result.error); // Display the error to the user
      }
    })
    .catch((error) => {
      console.error("Error while sending reply:", error);
    });
}

// DOMContentLoaded for initialization
document.addEventListener("DOMContentLoaded", function () {
  emailView = document.querySelector("#emails-view");
  composeView = document.querySelector("#compose-view");
  moreDetailedEmailView = document.querySelector("#email-details-view");

  document.querySelector("#inbox").addEventListener("click", () => {
    load_mailbox("inbox");
    update_button_classes("#inbox");
  });
  document.querySelector("#sent").addEventListener("click", () => {
    load_mailbox("sent");
    update_button_classes("#sent");
  });
  document.querySelector("#archived").addEventListener("click", () => {
    load_mailbox("archive");
    update_button_classes("#archived");
  });
  document.querySelector("#compose").addEventListener("click", () => {
    compose_email();
    update_button_classes("#compose");
  });

  document
    .querySelector("#compose-form")
    .addEventListener("submit", send_email);

  // By default, load the inbox
  load_mailbox("inbox");
  update_button_classes("#inbox");
});
