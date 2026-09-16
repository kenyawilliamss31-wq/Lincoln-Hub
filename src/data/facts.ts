// Fun facts about Lincoln. All verified against lincoln.edu/about/history.html
// and Lincoln's own "Lincoln Firsts" PDF — don't add one you haven't checked.

export const facts = [
  "Lincoln was chartered on April 29, 1854 as the Ashmun Institute, making it the nation's first degree-granting HBCU.",
  "It was renamed Lincoln University in 1866, a year after Abraham Lincoln's assassination.",
  "In its first 100 years, Lincoln graduated about 20% of all Black physicians and over 10% of all Black attorneys in the United States.",
  "Langston Hughes graduated in 1929. Thurgood Marshall graduated the next year, in 1930.",
  "Kwame Nkrumah, Ghana's first president, and Nnamdi Azikiwe, Nigeria's first president, are both Lincoln alumni.",
  "Albert Einstein came to campus in 1946 to lecture on physics and speak about racism.",
  "Lincoln alumni founded six colleges and universities, including South Carolina State and Texas Southern.",
  "President Brenda A. Allen is a Lincoln graduate, class of 1981.",
];

// Picks a fact based on today's date, so it changes daily but stays the same
// all day. The % operator gives the REMAINDER after division — so a date of 20
// with 8 facts gives 20 % 8 = 4, and we show facts[4]. This is how you cycle
// through a list using a number that keeps growing.
export function factOfTheDay() {
  const day = new Date().getDate();      // 1-31
  return facts[day % facts.length];      // % keeps the index inside the array
}
