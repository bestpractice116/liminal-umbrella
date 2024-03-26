import {google} from 'googleapis';
import {auth} from 'google-auth-library';
import creds from './rpgbot-google.json' assert { type: 'json' };

async function foo() {
  const client = auth.fromJSON(creds);
  console.log(client, 'client')
  client.scopes = ['https://www.googleapis.com/auth/spreadsheets.readonly'];
  const sheets = google.sheets({version: 'v4', auth: client});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: '13ZUnnMefSKwYgvwwJ0wueexY9w6oI5BxJzz6mZNcz-o',
    range: 'Membership List!A2:E',
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return;
  }
  console.log('Name, Major:');
  rows.forEach((row) => {
    // Print columns A and E, which correspond to indices 0 and 4.
    console.log(`${row[0]}, ${row[4]}`);
  });
}

foo().then(() => {
  console.log("BAR");
});
