// Fun facts about Lincoln. All verified against lincoln.edu/about/history.html
// and Lincoln's own "Lincoln Firsts" PDF — don't add one you haven't checked.

export const facts = [
"Lincoln University was chartered on April 29, 1854 as the Ashmun Institute, making it the nation's first degree-granting HBCU.",

"The university was founded by Rev. John Miller Dickey and his wife, Sarah Emlen Cresson.",

"Ashmun Institute was named after Jehudi Ashmun, a leader connected to Liberia and African education efforts.",

"Lincoln was originally created to provide higher education for young Black men at a time when most colleges would not admit them.",

"The school officially became Lincoln University on April 4, 1866, in honor of Abraham Lincoln.",

"Lincoln is older than the Civil War and has been educating students for more than 170 years.",

"Two white students graduated in Lincoln's first baccalaureate class in 1868.",

"Lincoln was once known as 'The Black Princeton' because of its academic rigor and Princeton connections.",

"The university's school colors are orange and blue.",

"Lincoln's mascot is Luther the Lion.",

"Lincoln's motto is 'If the Son shall make you free, ye shall be free indeed.'",

"Horace Mann Bond, Lincoln Class of 1923, became the university's first African American president in 1945.",

"Albert Einstein visited Lincoln in 1946, lectured students on physics, and spoke out against racism.",

"Einstein also received an honorary degree from Lincoln during his visit.",

"Langston Hughes graduated from Lincoln in 1929 before becoming one of the most influential writers of the Harlem Renaissance.",

"Thurgood Marshall graduated from Lincoln in 1930 before becoming the first Black U.S. Supreme Court Justice.",

"Kwame Nkrumah, the first president of Ghana, graduated from Lincoln in 1939.",

"Nnamdi Azikiwe, the first president of Nigeria, graduated from Lincoln in 1930.",

"Two future African presidents earned their degrees from Lincoln University.",

"During its first 100 years, Lincoln graduated about 20% of all Black physicians in the United States.",

"During that same period, Lincoln graduated more than 10% of all Black attorneys in the country.",

"Lincoln alumni have gone on to lead more than 35 colleges and universities.",

"Lincoln graduates helped participate in the founding of eight universities in the United States.",

"The university celebrated its 100th anniversary in 1953.",

"Lincoln amended its charter in 1953 to allow women to earn degrees.",

"In 1972, Lincoln officially became a state-related university in Pennsylvania.",

"Lincoln is accredited by the Middle States Commission on Higher Education.",

"The main campus sits on 429 acres in southern Chester County, Pennsylvania.",

"Lincoln also operates a location in University City, Philadelphia.",

"Lincoln competes in NCAA Division II athletics as a member of the CIAA.",

"President Brenda A. Allen, Lincoln Class of 1981, became the university's 14th president in 2017."

];

// Picks a fact based on today's date, so it changes daily but stays the same
// all day. The % operator gives the REMAINDER after division — so a date of 20
// with 8 facts gives 20 % 8 = 4, and we show facts[4]. This is how you cycle
// through a list using a number that keeps growing.
export function factOfTheDay() {
  const day = new Date().getDate();      // 1-31
  return facts[day % facts.length];      // % keeps the index inside the array
}
