// === Constants ===
const BASE = "https://fsa-crud-2aa9294fe819.herokuapp.com/api";
const COHORT = "/2601-FTB-ET-WEB-FT";
const API = BASE + COHORT;

// === State ===
let parties = [];
let selectedParty;
let guests = [];
let rsvps = [];

async function fetchFullstack(extension) {
  const response = await fetch(API + extension);
  const responseBody = await response.json();
  return responseBody.data;
}

async function getParties() {
  parties = await fetchFullstack("/events");
  render();
}

async function getParty(id) {
  selectedParty = await fetchFullstack(`/events/${id}`);

  rsvps = await fetchFullstack("/rsvps");
  try {
    rsvps = rsvps.filter((rsvp) => rsvp.eventId === id);
  } catch {
    rsvps = [];
  }

  guests = await fetchFullstack("/guests");
  try {
    guests = guests.filter((guest) => {
      const rsvp = rsvps.find((rsvp) => rsvp.guestId === guest.id);
      return rsvp != undefined;
    });
  } catch {
    guests = [];
  }

  render();
}

function formatDate(d) {
  const date = new Date(d);
  return date.toDateString();
}

// === Components ===
function PartyList() {
  const $ul = document.createElement("ul");
  $ul.classList.add("lineup");
  try {
    $ul.replaceChildren(...parties.map(PartyListItem));
  } catch {
    $ul.textContent = "No parties were found";
  }
  return $ul;
}

function PartyListItem(party) {
  const $li = document.createElement("li");
  $li.innerHTML = `
    <a href="#selected">${party.name}</a>
  `;
  if (selectedParty && selectedParty.id === party.id) {
    $li.classList.add("selected");
  }
  $li.addEventListener("click", () => {
    getParty(party.id);
  });
  return $li;
}

function PartyDetails() {
  if (!selectedParty) {
    const $p = document.createElement("p");
    $p.textContent = "Please select a party to learn more.";
    return $p;
  }

  const $section = document.createElement("section");
  $section.classList.add("party");
  $section.innerHTML = `
    <h3>${selectedParty.name} #${selectedParty.id}</h3>
    <section>
      <p id="date">${formatDate(selectedParty.date)}</p>
      <p id="location">${selectedParty.location}</p>
    </section>
    <p id="description">${selectedParty.description}</p>
    <GuestList></GuestList>
  `;
  $section.querySelector("GuestList").replaceWith(GuestList());
  return $section;
}

function GuestList() {
  const $ul = document.createElement("ul");
  $ul.replaceChildren(...guests.map(GuestListItem));
  return $ul;
}

function GuestListItem(guest) {
  const $li = document.createElement("li");
  $li.textContent = guest.name;
  return $li;
}

// === Render ===
function render() {
  const $app = document.querySelector("#app");
  $app.innerHTML = `
    <h1>Party Planner</h1>
    <main>
      <section>
        <h2>Upcoming Parties</h2>
        <PartyList></PartyList>
      </section>
      <section id="selected">
        <h2>Party Details</h2>
        <PartyDetails></PartyDetails>
      </section>
    </main>
  `;
  $app.querySelector("PartyList").replaceWith(PartyList());
  $app.querySelector("PartyDetails").replaceWith(PartyDetails());
}

async function init() {
  await getParties();
  render();
}

init();
