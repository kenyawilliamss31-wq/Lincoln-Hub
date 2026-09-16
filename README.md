# Lincoln Hub

A mobile app that puts Lincoln University campus information in one place — events,
dining, athletics, the academic calendar, campus directory, and quick links to the
services students actually use.

Built with React Native, Expo, and TypeScript.

> **Not an official Lincoln University app.** This is an independent student project.
> It is not affiliated with or endorsed by Lincoln University, and the Digital ID
> screen is a display mockup, not a valid credential.

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

## Screenshots

<!-- Add screenshots here. On GitHub you can drag images straight into this
     file while editing and it will upload them for you. -->

## Tech

- **React Native** with **Expo** (SDK 57)
- **TypeScript**
- **expo-router** for file-based navigation
- **expo-web-browser** for outbound links
- **@expo/vector-icons** (Ionicons)

## Running it locally

```bash
git clone https://github.com/kenyawilliamss31-wq/lincoln-hub.git
cd lincoln-hub
npm install
npx expo start
```

Scan the QR code with the Expo Go app, or press `w` to open it in a browser.

## How it is organized


Two components do most of the work. `ScreenShell` provides the scrollable page
frame, heading, and padding that every screen shares. `InfoCard` renders a list
row with an optional left column, a title, and detail lines. Eight screens use
them, so a change to spacing or corner radius happens in one file.

## What is next

- [ ] Replace placeholder data with verified information from Lincoln
- [ ] Real dining hours and directory phone numbers
- [ ] Actual athletics results and schedule
- [ ] Push notifications for upcoming events
- [ ] Accessibility pass on color contrast and touch target sizes

## About

Built by Kenya Williams, computer science student at Lincoln University.
