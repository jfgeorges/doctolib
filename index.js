const express = require("express");
const bodyParser = require("body-parser");

const appServer = express();
appServer.use(bodyParser.json());

// --------- //
// VARIABLES //
// --------- //

// Tableau de gestions des données de consultation
// Contient les différents slots de réservation par journée
const consultations = [];

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
const idDateConsultation = dateToCheck => {
  for (let i = 0; i < consultations.length; i++) {
    if (consultations[i].date === dateToCheck) {
      return i;
    }
  }
  // Ajout de la nouvelle date si non trouvée
  return newDateConsult(dateToCheck);
  //   return consultations.length - 1;
};

const isSlotAvailable = (idDate, slotToCheck) => {
  return consultations[idDate].slots[slotToCheck].isAvailable;
};

// Réserve un créneau pour une date et un patient
// Retourne 'true' si la réservation est OK, 'false' sinon
const bookConsultation = (bookedDate, bookedSlot, patientName) => {
  const idDate = idDateConsultation(bookedDate);
  console.log("Date demandée: " + bookedDate, "Consult: " + consultations[idDate].date);
  // Si le créneau est dispo pour cette date, on ajoute le nom du patient
  if (isSlotAvailable(idDate, bookedSlot)) {
    console.log("Résa pour " + consultations[idDate].date);
    consultations[idDate].slots[bookedSlot].name = patientName;
    consultations[idDate].slots[bookedSlot].isAvailable = false;
    return true;
  }
  return false;
};

const displayConsultation = dateToDisplay => {
  const idDate = idDateConsultation(dateToDisplay);
  //   return consultations[idDate];
  return consultations;
};

// ------ //
// ROUTES //
// ------ //

// Méthode GET pour afficher les créneaux disponibles en fontion d'une date
appServer.get("/visits", (req, res) => {
  res.json(displayConsultation(req.query.date));
});

// Méthode POST pour réserver un créneau
appServer.post("/visits", (req, res) => {
  if (bookConsultation(req.body.date, req.body.slot, req.body.name)) {
    return res.json({ message: "Successfuly booked" });
  }
  res.json({
    error: {
      message: "Slot already booked"
    }
  });
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
