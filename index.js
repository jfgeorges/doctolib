const express = require("express");
const bodyParser = require("body-parser");
const dateFns = require("date-fns");

const appServer = express();
appServer.use(bodyParser.json());

// --------- //
// VARIABLES //
// --------- //

// Tableau de gestions des données de consultation
// Contient les différents slots de réservation par journée
const consultations = [];

// Objet renvoyé en réponse en cas d'erreur
const errors = {
  error: {
    message: ""
  }
};

// --------- //
// FONCTIONS //
// --------- //

// Ajout d'une nouvelle journée de consultation pour la date 'newDate'
// initialisée avec un objet contenant les créneaux disponibles sur une journée
const newDateConsult = newDate => {
  consultations.push({
    date: newDate,
    slots: {
      "1000": { isAvailable: true },
      "1030": { isAvailable: true },
      "1100": { isAvailable: true },
      "1130": { isAvailable: true },
      "1400": { isAvailable: true },
      "1430": { isAvailable: true },
      "1500": { isAvailable: true },
      "1530": { isAvailable: true },
      "1600": { isAvailable: true },
      "1630": { isAvailable: true },
      "1700": { isAvailable: true },
      "1730": { isAvailable: true }
    }
  });
  return consultations.length - 1;
};

// Vérifie si la journée de consultation demandée existe déjà dans le tableau
// Si elle n'existe pas, la nouvelle date est ajoutée et initialisée dans le tableau 'consultations'
// Retourne la position de la date trouvée dans 'consultations[]' ou le dernier indice du tableau si elle a été ajoutée.
const indexDateConsultation = dateToCheck => {
  for (let i = 0; i < consultations.length; i++) {
    if (consultations[i].date === dateToCheck) {
      return i;
    }
  }
  // Ajout de la nouvelle date si non trouvée
  return newDateConsult(dateToCheck);
};

const isSlotAvailable = (indexDate, slotToCheck) => {
  return consultations[indexDate].slots[slotToCheck].isAvailable;
};

// Génère une clé de réservation
const idBooking = (bookedDate, patientName) => {
  return bookedDate.replace(/-/g, "") + patientName[0] + Math.floor(Math.random() * 101);
};

// Annule une réservation d'après son ID
const cancelBooking = idToFind => {
  for (let i = 0; i < consultations.length; i++) {
    for (const slot in consultations[i].slots) {
      if (consultations[i].slots[slot].bookingId === idToFind) {
        consultations[i].slots[slot].name = "";
        consultations[i].slots[slot].isAvailable = true;
        consultations[i].slots[slot].bookingId = "";
        return { message: "Booking cancelled" };
      }
    }
  }
  errors.error.message = `Booking N°${idToFind} not found !`;
  return errors;
};

// Réserve un créneau pour une date et un patient
// Retourne un objet en fonction du résultat
const bookConsultation = (bookedDate, bookedSlot, patientName) => {
  // Vérification d'une date de réservation dans le passé
  //   console.log(bookedDate, dateFns.isPast(bookedDate));
  if (dateFns.isPast(bookedDate)) {
    errors.error.message = `Booking date ${bookedDate} is in the past`;
    return errors;
  }
  if (dateFns.getDay(bookedDate) === 0) {
    errors.error.message = `${bookedDate} the doctor doesn't work on sunday !`;
    return errors;
  }
  const indexDate = indexDateConsultation(bookedDate);

  // Si le créneau est dispo pour cette date, on ajoute le nom du patient
  if (isSlotAvailable(indexDate, bookedSlot)) {
    consultations[indexDate].slots[bookedSlot].name = patientName;
    consultations[indexDate].slots[bookedSlot].bookingId = idBooking(bookedDate, patientName);
    consultations[indexDate].slots[bookedSlot].isAvailable = false;
    return { message: "Successfuly booked" };
  }
  // Sinon (test homis du fait du return précédent), message d'erreur
  errors.error.message = "Slot already booked";
  return errors;
};

const displayConsultation = dateToDisplay => {
  const indexDate = indexDateConsultation(dateToDisplay);
  return consultations[indexDate];
};

const displayConsultationSansId = dateToDisplay => {
  const indexDate = indexDateConsultation(dateToDisplay);
  const slotArray = [];
  slotArray.push({ date: dateToDisplay });
  for (const slot in consultations[indexDate].slots) {
    slotArray.push({ [`${slot}`]: { Available: consultations[indexDate].slots[slot].isAvailable, name: consultations[indexDate].slots[slot].name } });
  }
  return slotArray;
};

// ------ //
// ROUTES //
// ------ //

// Méthode GET pour afficher les créneaux disponibles en fontion d'une date
appServer.get("/visits", (req, res) => {
  res.json(displayConsultation(req.query.date));
});

appServer.get("/visitssansid", (req, res) => {
  res.json(displayConsultationSansId(req.query.date));
});

// Méthode POST pour réserver un créneau
appServer.post("/visits", (req, res) => {
  res.json(bookConsultation(req.body.date, req.body.slot, req.body.name));
});

// Méthode POST pour supprimer une réservation
appServer.post("/cancelbooking", (req, res) => {
  res.json(cancelBooking(req.body.bookingId));
});

appServer.all("*", (req, res) => {
  res.status(404).send("Doctolib: Page introuvable");
});

// ----------------- //
// DEMARRAGE SERVEUR //
// ----------------- //
appServer.listen(3000, () => {
  console.log("Server Doctolib started");
});
