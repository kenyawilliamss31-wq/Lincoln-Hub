# Lincoln Hub

A mobile app that puts Lincoln University campus information in one place —
events, dining, athletics, the academic calendar, campus directory, and quick
links to the services students actually use.

Built with React Native, Expo, and TypeScript.

> Not affiliated with Lincoln University. Independent student project.
> The Digital ID screen is a mockup, not a real credential.

## Screens

| Screen | What it does |
| --- | --- |
| Home | Greeting with live date, next upcoming event, a rotating Lincoln fun fact, and navigation to every section |
| Events | Upcoming campus events with dates and locations |
| Sports | Past results color-coded by win or loss, plus the upcoming schedule |
| Dining | Hall locations and serving hours |
| Academic Calendar | Key dates for the term |
| Campus Directory | Offices, phone numbers, and hours |
| Campus Map | Building list with a link to the official campus map |
| Digital ID | Student ID card mockup |
| Quick Links | One-tap access to LU Self-Service, email, tutoring, and the registrar |

## Tech

- **React Native** with **Expo** (SDK 57)
- **TypeScript**
- **expo-router** for file-based navigation
- **expo-web-browser** for outbound links
- **@expo/vector-icons** (Ionicons)

## Run it locally

```bash
git clone https://github.com/kenyawilliamss31-wq/lincoln-hub.git
cd lincoln-hub
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `w` to open it in a browser.

## Structure

`ScreenShell` and `InfoCard` do most of the layout work, so all eight screens
share their padding, heading, and card style. Change one file, everything
updates.

---

Built by Kenya Williams. Reach me at [kenyawilliamss31@gmail.com](mailto:kenyawilliamss31@gmail.com).
