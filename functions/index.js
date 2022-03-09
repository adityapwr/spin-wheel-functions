const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require("firebase-admin");
admin.initializeApp();

// Take the number parameter passed to this HTTP endpoint and insert it into
exports.addUser = functions.https.onRequest(async (req, res) => {
  // Grab the text parameter.
  const original = req.query.text;
  // Push the new message into Firestore using the Firebase Admin SDK.
  const writeResult = await admin.firestore().collection("users").add({
    code: "ACESAfw",
    mobile: original,
    cat: "paytm",
    spin: false,
    win: true,
  });
  // Send back a message that we've successfully written the message
  res.json({ result: `Message with ID: ${writeResult.id} added.` });
});

exports.findUser = functions.https.onRequest(async (req, res) => {
  // Grab the number parameter.
  const original = req.query.number;

  // Set users collection
  const userRef = admin
    .firestore()
    .collection("users")
    .where("mobile", "==", original);

  try {
    await admin.firestore().runTransaction(async (t) => {
      const docs = await t.get(userRef);
      if (docs.empty) {
        console.log("No matching documents.");
        res.json({ result: `User not found in db` });
      }
      docs.forEach((doc) => {
        if (!doc.data().spin) {
          t.update(admin.firestore().collection("users").doc(doc.id), {
            spin: true,
          });
          res.json({
            result: `User found in db`,
            win: doc.data().win,
            category: doc.data().cat,
            code: doc.data().code,
            spin: doc.data().spin,
          });
        } else {
          res.json({
            result: `User with this ID already spin the wheel`,
            win: doc.data().win,
            spin: doc.data().spin,
          });
        }
      });
      console.log("Transaction success!");
    });
  } catch (e) {
    console.log("Transaction failure:", e);
  }
});
