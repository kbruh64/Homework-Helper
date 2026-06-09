// Generates topics index + a clean page for every Grade 3 and Grade 4 math topic.
// Run: node build-topics.js
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, 'topics');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const FONT_LINK = `<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />`;

const NAV = (cssPath, homePath, topicsPath) => `<nav>
  <a class="brand" href="${homePath}">
    <span class="brand-dot" aria-hidden="true"></span>
    <span>Pebble</span>
  </a>
  <div class="nav-links">
    <a href="${topicsPath}">Topics</a>
    <a href="${homePath}#features">Features</a>
    <a href="${homePath}#how">How it works</a>
  </div>
  <a href="${homePath}#start" class="nav-cta">Open Pebble</a>
</nav>`;

const FOOTER = `<footer>
  <div>Made for kids who deserve a patient helper.</div>
  <div class="links">
    <a href="#">Privacy</a>
    <a href="#">For teachers</a>
    <a href="#">Contact</a>
  </div>
</footer>`;

// ─── TOPIC DATA ────────────────────────────────────────────────────────────
// Each topic: slug, title, blurb, learn[], examples[{q,a}], slips[{title,desc}]
const grade3 = [
  {
    slug: 'place-value',
    title: 'Place Value',
    blurb: 'Numbers up to 1,000 are made of hundreds, tens, and ones. Knowing where each digit lives is the start of every operation.',
    learn: [
      ['Read and write numbers up to 1,000', 'In digits and in words.'],
      ['Identify the place of a digit', 'Hundreds, tens, ones — and what each one is worth.'],
      ['Compare and order numbers', 'Use place value to decide which is larger.'],
      ['Round to the nearest 10 or 100', 'Look one place to the right to decide.'],
    ],
    examples: [
      { q: 'What is the value of 4 in 642?', a: '40 — it is in the tens place.' },
      { q: 'Round 287 to the nearest 100.', a: '300' },
      { q: 'Which is larger: 519 or 591?', a: '591' },
    ],
    slips: [
      ['Reading the digit, not the place', 'Saying the 4 in 642 is worth "4" instead of 40.'],
      ['Rounding the wrong direction', 'Rounding 287 to 200 because the 2 is smaller.'],
    ],
  },
  {
    slug: 'addition-subtraction',
    title: 'Addition & Subtraction',
    blurb: 'Adding and subtracting within 1,000, with regrouping and word problems. The goal is fluency, not speed.',
    learn: [
      ['Add and subtract three-digit numbers', 'Stack the place values and work right to left.'],
      ['Regroup when a column overflows', 'Carry a ten over, or borrow one from the next place.'],
      ['Estimate sums and differences', 'Round first, then add — useful as a sanity check.'],
      ['Solve one and two-step word problems', 'Read carefully and pick the operation.'],
    ],
    examples: [
      { q: '345 + 278 = ?', a: '623' },
      { q: '802 − 467 = ?', a: '335' },
      { q: 'Maya had 412 stickers. She gave away 138. How many are left?', a: '274' },
    ],
    slips: [
      ['Forgetting to regroup', 'Writing 5 in the tens column when 12 was the actual sum.'],
      ['Subtracting the smaller from the larger digit', 'Doing 7 − 2 instead of borrowing when 2 is on top.'],
    ],
  },
  {
    slug: 'multiplication',
    title: 'Multiplication',
    blurb: 'Multiplication is a shortcut for adding equal groups. Once that clicks, the times tables are just memory.',
    learn: [
      ['See multiplication as equal groups', '4 × 3 means four groups of three.'],
      ['Use arrays to picture it', 'Rows times columns gives the total.'],
      ['Memorize facts up to 10 × 10', 'Build fluency with a few each week.'],
      ['Multiply by 0, 1, and 10', 'Patterns make these the easiest to lock in.'],
    ],
    examples: [
      { q: '6 × 4 = ?', a: '24' },
      { q: 'Three plates have 5 cookies each. How many cookies?', a: '15' },
      { q: '7 × 0 = ?', a: '0' },
    ],
    slips: [
      ['Confusing × with +', 'Reading 4 × 3 as 4 + 3 = 7.'],
      ['Rote without meaning', 'Knowing 6 × 7 = 42 but not what it counts.'],
    ],
  },
  {
    slug: 'division',
    title: 'Division',
    blurb: 'Division splits a total into equal groups. It is the inverse of multiplication — and that link is the key to remembering facts.',
    learn: [
      ['See division as sharing equally', '12 ÷ 3 means twelve shared into three groups.'],
      ['Use multiplication to check', 'If 12 ÷ 3 = 4, then 4 × 3 should give 12.'],
      ['Know division facts to 100 ÷ 10', 'Work backward from the times tables.'],
      ['Notice when there are leftovers', 'A remainder means the share was not even.'],
    ],
    examples: [
      { q: '24 ÷ 6 = ?', a: '4' },
      { q: '15 cookies shared by 3 kids. How many each?', a: '5' },
      { q: '13 ÷ 4 = ?', a: '3 remainder 1' },
    ],
    slips: [
      ['Dividing in the wrong direction', 'Doing 6 ÷ 24 instead of 24 ÷ 6.'],
      ['Ignoring remainders', 'Saying 13 ÷ 4 = 3 and forgetting the leftover.'],
    ],
  },
  {
    slug: 'fractions',
    title: 'Fractions',
    blurb: 'A fraction is a way to name part of a whole. The bottom number is how many pieces it is cut into; the top is how many you have.',
    learn: [
      ['Identify numerator and denominator', 'Top is how many. Bottom is the size of each piece.'],
      ['Place fractions on a number line', 'Between 0 and 1, evenly spaced.'],
      ['Find equivalent fractions', 'Different names for the same amount.'],
      ['Compare fractions with the same top or bottom', 'When one part is the same, comparing is easy.'],
    ],
    examples: [
      { q: 'Which is larger: 1/3 or 1/4?', a: '1/3 — fewer pieces means each one is bigger.' },
      { q: 'Is 2/4 the same as 1/2?', a: 'Yes — same amount, different names.' },
      { q: 'Place 3/8 on a number line from 0 to 1.', a: 'Just under halfway.' },
    ],
    slips: [
      ['Bigger bottom means bigger fraction', '1/8 is smaller than 1/4, even though 8 > 4.'],
      ['Adding tops and bottoms', 'Saying 1/2 + 1/2 = 2/4 instead of 1.'],
    ],
  },
  {
    slug: 'measurement',
    title: 'Measurement',
    blurb: 'Length, mass, and capacity — the standard units and when to use them. Estimating before measuring builds number sense.',
    learn: [
      ['Use cm, m, and km for length', 'A pencil in cm. A hallway in m. A drive in km.'],
      ['Use g and kg for mass', 'A grape in grams. A backpack in kilograms.'],
      ['Use mL and L for liquids', 'A spoonful in mL. A juice bottle in L.'],
      ['Pick the right unit', 'Big things use big units. Small things use small.'],
    ],
    examples: [
      { q: 'What unit measures the length of a car?', a: 'Meters (m).' },
      { q: 'Estimate the mass of an apple.', a: 'About 150 grams.' },
      { q: 'Which is bigger: 1 L or 750 mL?', a: '1 L (it is 1,000 mL).' },
    ],
    slips: [
      ['Mixing units', 'Adding 50 cm and 1 m without converting first.'],
      ['Picking a unit that is too big or small', 'Measuring a textbook in kilometers.'],
    ],
  },
  {
    slug: 'time',
    title: 'Time',
    blurb: 'Reading clocks, knowing AM from PM, and figuring out how long something took. Elapsed time is the part most kids find tricky.',
    learn: [
      ['Tell time to the nearest minute', 'On both digital and analog clocks.'],
      ['Use AM and PM', 'AM is morning. PM is afternoon and evening.'],
      ['Find elapsed time', 'Count forward from the start to the end.'],
      ['Solve time word problems', 'Sketch a number line if it helps.'],
    ],
    examples: [
      { q: 'A movie starts at 2:15 and ends at 3:40. How long is it?', a: '1 hour 25 minutes.' },
      { q: 'School starts at 8:30 AM. Lunch is 4 hours later. When?', a: '12:30 PM.' },
      { q: 'Read 7:48 — how many minutes to 8:00?', a: '12 minutes.' },
    ],
    slips: [
      ['Treating time like base-10', 'Doing 3:40 − 2:15 = 1:25 by subtracting columns is correct, but 3:10 − 2:45 trips many kids up.'],
      ['Crossing AM/PM without noticing', 'Forgetting that 11 AM to 2 PM is 3 hours.'],
    ],
  },
  {
    slug: 'money',
    title: 'Money',
    blurb: 'Coins, bills, totals, and making change. Money is just decimals dressed up — but the practical version comes first.',
    learn: [
      ['Identify coins and bills', 'Know each value at a glance.'],
      ['Count mixed coins and bills', 'Start with the largest values.'],
      ['Make change', 'Count up from the price to the amount given.'],
      ['Solve money word problems', 'Most are just addition and subtraction.'],
    ],
    examples: [
      { q: '3 quarters, 2 dimes, 4 pennies — total?', a: '$0.99' },
      { q: 'A toy costs $4.65. You pay $5.00. Change?', a: '$0.35' },
      { q: 'You have $2.50. A book is $1.75. Enough?', a: 'Yes — you have $0.75 left.' },
    ],
    slips: [
      ['Counting smallest coins first', 'Slows everything down and causes errors.'],
      ['Mixing up dimes and pennies', 'They are similar in size but worth ten times different.'],
    ],
  },
  {
    slug: 'geometry',
    title: 'Geometry',
    blurb: 'Shapes, their parts, and how to tell them apart. The names and the rules — squares, triangles, prisms, and what makes each one itself.',
    learn: [
      ['Name 2D shapes by their sides', 'Triangle, quadrilateral, pentagon, hexagon.'],
      ['Name 3D shapes by their faces', 'Cube, sphere, cone, cylinder, prism.'],
      ['Use the words sides, vertices, faces, edges', 'Vertices are corners. Edges are where two faces meet.'],
      ['Find lines of symmetry', 'A fold line that makes both halves match.'],
    ],
    examples: [
      { q: 'How many sides does a hexagon have?', a: '6' },
      { q: 'How many edges does a cube have?', a: '12' },
      { q: 'How many lines of symmetry does a square have?', a: '4' },
    ],
    slips: [
      ['Confusing 2D and 3D names', 'Calling a cube a square.'],
      ['Mixing up faces and edges', 'Faces are flat sides. Edges are the lines between them.'],
    ],
  },
  {
    slug: 'area-perimeter',
    title: 'Area & Perimeter',
    blurb: 'Perimeter is the trip around the outside. Area is the space inside. Same shape, two different questions.',
    learn: [
      ['Find perimeter by adding the sides', 'Walk around the shape — add each side as you go.'],
      ['Count squares to find area', 'How many unit squares fit inside.'],
      ['Use multiplication for rectangle area', 'Length × width gives the total.'],
      ['Tell when a problem wants area vs. perimeter', 'Fence around a yard is perimeter. Carpet inside is area.'],
    ],
    examples: [
      { q: 'A rectangle is 4 cm by 7 cm. Area?', a: '28 sq cm.' },
      { q: 'Same rectangle. Perimeter?', a: '22 cm.' },
      { q: 'A square has side 5 m. Area?', a: '25 sq m.' },
    ],
    slips: [
      ['Mixing up the formulas', 'Multiplying for perimeter or adding for area.'],
      ['Forgetting square units for area', 'Writing "28 cm" instead of "28 sq cm".'],
    ],
  },
  {
    slug: 'data-graphs',
    title: 'Data & Graphs',
    blurb: 'Collecting data, drawing it as a chart, and reading what the chart says back. Bar graphs and pictographs are the workhorses.',
    learn: [
      ['Read a bar graph', 'Match each bar to its label and check the scale.'],
      ['Read a pictograph', 'Each picture stands for a number — use the key.'],
      ['Make a tally chart', 'One mark per item. Cross every fifth one.'],
      ['Answer questions from a graph', 'How many more, how many fewer, what was the total.'],
    ],
    examples: [
      { q: 'A pictograph shows 4 stars for apples. Each star = 5. How many apples?', a: '20' },
      { q: 'On a bar graph, dogs reach 8 and cats reach 5. How many more dogs?', a: '3' },
      { q: 'A tally is "||||  ||||  |". What number?', a: '11' },
    ],
    slips: [
      ['Ignoring the key on a pictograph', 'Counting symbols without checking what each one is worth.'],
      ['Misreading a scale that skips numbers', 'A bar graph going 0, 5, 10, 15 — not 0, 1, 2.'],
    ],
  },
  {
    slug: 'patterns',
    title: 'Patterns',
    blurb: 'Numbers and shapes that repeat by a rule. The trick is figuring out the rule from a few terms — then using it to predict what comes next.',
    learn: [
      ['Spot the rule in a number pattern', 'Add 5? Times 2? Look at the gap.'],
      ['Continue a pattern', 'Apply the rule to find the next few terms.'],
      ['Recognize shape and color patterns', 'AABB, ABCABC, and so on.'],
      ['Read a simple input/output table', 'A rule turns each input into its output.'],
    ],
    examples: [
      { q: 'Continue: 3, 6, 9, 12, ___', a: '15 — rule is +3.' },
      { q: 'Continue: 2, 4, 8, 16, ___', a: '32 — rule is ×2.' },
      { q: 'If the rule is "add 7", what is the output for 11?', a: '18' },
    ],
    slips: [
      ['Picking the wrong rule from too few terms', 'Two terms is not enough — check at least three.'],
      ['Continuing by gut', 'Always test the rule against the given terms first.'],
    ],
  },
];

const grade4 = [
  {
    slug: 'place-value-large',
    title: 'Place Value (to Millions)',
    blurb: 'Reading and writing numbers up to one million, and understanding how each place is ten times the one to its right.',
    learn: [
      ['Read numbers through the millions', 'Group digits in threes — millions, thousands, ones.'],
      ['Write numbers in standard, word, and expanded form', 'Three ways to say the same thing.'],
      ['Compare and order large numbers', 'Line up place values and look from the left.'],
      ['Round to any place', 'Hundred thousands, ten thousands, thousands — same rule, different column.'],
    ],
    examples: [
      { q: 'Round 47,283 to the nearest thousand.', a: '47,000' },
      { q: 'Which is larger: 304,719 or 304,917?', a: '304,917' },
      { q: 'Write 26,084 in expanded form.', a: '20,000 + 6,000 + 80 + 4' },
    ],
    slips: [
      ['Skipping a zero in expanded form', 'Forgetting the place that has a zero.'],
      ['Rounding the wrong column', 'Looking at the digit in the rounding column instead of the one to its right.'],
    ],
  },
  {
    slug: 'multi-digit-add-sub',
    title: 'Multi-Digit Addition & Subtraction',
    blurb: 'Working with numbers up to six digits. Same algorithm, more columns — line them up by place value and trust the process.',
    learn: [
      ['Add and subtract numbers up to six digits', 'Use the standard algorithm.'],
      ['Estimate first', 'Round both numbers, then check your exact answer against it.'],
      ['Solve multi-step word problems', 'Sometimes you add, sometimes subtract, sometimes both.'],
      ['Borrow across multiple zeros', 'When subtracting from numbers like 5,000 — borrow once and pass it down.'],
    ],
    examples: [
      { q: '34,827 + 12,694 = ?', a: '47,521' },
      { q: '60,000 − 28,475 = ?', a: '31,525' },
      { q: 'A library had 12,408 books. They got 1,375 more and lost 482. How many now?', a: '13,301' },
    ],
    slips: [
      ['Misaligning the columns', 'Especially when one number has fewer digits.'],
      ['Borrowing chains', 'Subtracting from 5,000 — getting one of the borrows wrong.'],
    ],
  },
  {
    slug: 'multi-digit-multiplication',
    title: 'Multi-Digit Multiplication',
    blurb: 'Multiplying 2, 3, and 4-digit numbers. The standard algorithm and the area model both work — pick the one that helps you see it.',
    learn: [
      ['Multiply a multi-digit number by a 1-digit number', 'Build up from times tables you already know.'],
      ['Multiply two 2-digit numbers', 'Each digit on top times each digit on bottom — then add.'],
      ['Use the area model', 'Break each number into its place values and multiply each piece.'],
      ['Estimate to check', 'Round, multiply roughly, see if your answer is in range.'],
    ],
    examples: [
      { q: '34 × 6 = ?', a: '204' },
      { q: '23 × 47 = ?', a: '1,081' },
      { q: 'Estimate 198 × 4.', a: 'About 800.' },
    ],
    slips: [
      ['Forgetting to shift the second row', 'When multiplying by tens, the partial product needs a zero placeholder.'],
      ['Place value drift', 'Carrying digits into the wrong column.'],
    ],
  },
  {
    slug: 'long-division',
    title: 'Long Division',
    blurb: 'Dividing big numbers by a single-digit divisor. Four steps repeated: divide, multiply, subtract, bring down.',
    learn: [
      ['Divide a 3 or 4-digit number by a 1-digit number', 'Work left to right.'],
      ['Run the four-step cycle', 'Divide, multiply, subtract, bring down — repeat until done.'],
      ['Interpret the remainder in context', 'Sometimes round up, sometimes leave it, sometimes share more.'],
      ['Estimate the quotient first', 'Helps you catch a wrong digit early.'],
    ],
    examples: [
      { q: '845 ÷ 5 = ?', a: '169' },
      { q: '92 ÷ 4 = ?', a: '23' },
      { q: '17 cookies for 4 kids. How many each, and what is left?', a: '4 each, 1 left over.' },
    ],
    slips: [
      ['Dropping the bring-down step', 'Skipping a digit makes the answer the wrong size.'],
      ['Misreading the remainder', 'Saying "5 buses needed for 17 kids if each holds 4" but answering 4.'],
    ],
  },
  {
    slug: 'factors-multiples',
    title: 'Factors & Multiples',
    blurb: 'Factors divide evenly into a number. Multiples are what you get by multiplying. Prime numbers are the ones with only two factors.',
    learn: [
      ['Find all factor pairs of a number', 'Numbers that multiply to give it.'],
      ['Find multiples', 'The times table of a number — never ends.'],
      ['Tell prime from composite', 'Prime: only 1 and itself. Composite: more than two factors.'],
      ['Spot common factors', 'Numbers that show up in both lists.'],
    ],
    examples: [
      { q: 'List all factors of 24.', a: '1, 2, 3, 4, 6, 8, 12, 24.' },
      { q: 'Is 17 prime or composite?', a: 'Prime — only 1 and 17 work.' },
      { q: 'First five multiples of 6?', a: '6, 12, 18, 24, 30.' },
    ],
    slips: [
      ['Mixing up factors and multiples', 'They go in opposite directions.'],
      ['Forgetting 1 and the number itself', 'Both are always factors.'],
    ],
  },
  {
    slug: 'fractions-advanced',
    title: 'Fractions (Advanced)',
    blurb: 'Adding and subtracting with like denominators, comparing with unlike ones, and converting between mixed numbers and improper fractions.',
    learn: [
      ['Add and subtract fractions with the same bottom', 'Just add or subtract the tops.'],
      ['Compare fractions with different bottoms', 'Find a common denominator first.'],
      ['Convert between mixed numbers and improper fractions', 'Same amount, two ways to write it.'],
      ['Multiply a fraction by a whole number', '3 × 1/4 means three groups of one-fourth.'],
    ],
    examples: [
      { q: '2/5 + 1/5 = ?', a: '3/5' },
      { q: 'Write 7/3 as a mixed number.', a: '2 1/3' },
      { q: 'Which is larger: 3/4 or 5/8?', a: '3/4 (which is 6/8).' },
    ],
    slips: [
      ['Adding the bottoms too', 'Saying 1/4 + 1/4 = 2/8.'],
      ['Comparing without a common denominator', 'Guessing 3/5 < 1/2 because 3 < 5.'],
    ],
  },
  {
    slug: 'decimals',
    title: 'Decimals',
    blurb: 'Decimals are fractions with denominators of 10 or 100. The decimal point is just a marker for where ones end.',
    learn: [
      ['Connect decimals to fractions', '0.5 is 1/2. 0.25 is 1/4.'],
      ['Read decimals to the hundredths', 'Tenths, then hundredths — each place is ten times smaller.'],
      ['Compare decimals', 'Line up the decimal points and look from the left.'],
      ['Add and subtract decimals', 'Stack them by the decimal point, fill missing places with zeros.'],
    ],
    examples: [
      { q: 'Which is larger: 0.3 or 0.27?', a: '0.3 — it is the same as 0.30.' },
      { q: 'Write 3/4 as a decimal.', a: '0.75' },
      { q: '1.4 + 0.65 = ?', a: '2.05' },
    ],
    slips: [
      ['Treating 0.27 as bigger than 0.3', 'Because 27 looks bigger than 3.'],
      ['Forgetting to line up decimals when adding', 'Lining up the right edges instead.'],
    ],
  },
  {
    slug: 'measurement-conversions',
    title: 'Measurement Conversions',
    blurb: 'Switching between units in the same system — cm to m, g to kg, mL to L. Multiply or divide by powers of ten.',
    learn: [
      ['Convert between metric units', '100 cm in a meter. 1,000 g in a kilogram.'],
      ['Solve multi-step measurement problems', 'Convert first, then add or subtract.'],
      ['Measure angles in degrees', 'Use a protractor — start at zero, follow the arc.'],
      ['Classify angles', 'Acute, right, obtuse, straight.'],
    ],
    examples: [
      { q: 'How many cm in 2.5 m?', a: '250 cm' },
      { q: '3,200 g = ___ kg?', a: '3.2 kg' },
      { q: 'A 90° angle is called?', a: 'A right angle.' },
    ],
    slips: [
      ['Multiplying when you should divide', 'Going from a small unit to a big one means dividing.'],
      ['Misaligning the protractor', 'Reading the wrong scale on a 180° tool.'],
    ],
  },
  {
    slug: 'time-elapsed',
    title: 'Elapsed Time',
    blurb: 'How long something lasted, especially across hours and AM/PM boundaries. A number line is the cleanest way to handle it.',
    learn: [
      ['Find elapsed time across hours', 'Count hours first, then minutes.'],
      ['Cross AM/PM without skipping', 'Noon is 12 PM, midnight is 12 AM.'],
      ['Convert seconds, minutes, hours, days', '60 each step except 24 for hours-to-days.'],
      ['Solve multi-event time problems', 'Add up each piece in order.'],
    ],
    examples: [
      { q: 'From 10:45 AM to 1:20 PM. How long?', a: '2 hours 35 minutes.' },
      { q: 'How many minutes in 3 hours?', a: '180' },
      { q: 'A movie is 105 minutes. How long is that?', a: '1 hour 45 minutes.' },
    ],
    slips: [
      ['Subtracting times like decimals', 'Treating 1:20 − 10:45 the wrong way around.'],
      ['Skipping over 12:00', 'Forgetting it switches AM to PM or back.'],
    ],
  },
  {
    slug: 'geometry-lines-angles',
    title: 'Lines, Angles & Triangles',
    blurb: 'Points, lines, line segments, rays, and the angles they make. Triangles get classified by both their sides and their angles.',
    learn: [
      ['Tell points, lines, segments, and rays apart', 'Each one has a different definition.'],
      ['Recognize parallel and perpendicular lines', 'Parallel never meet. Perpendicular cross at 90°.'],
      ['Classify triangles by angles', 'Acute, right, obtuse.'],
      ['Classify triangles by sides', 'Equilateral, isosceles, scalene.'],
    ],
    examples: [
      { q: 'A triangle with all sides equal is called?', a: 'Equilateral.' },
      { q: 'Two lines that meet at 90° are?', a: 'Perpendicular.' },
      { q: 'A triangle has angles 90°, 45°, 45°. Type?', a: 'Right and isosceles.' },
    ],
    slips: [
      ['Confusing parallel and perpendicular', 'They are opposites, not synonyms.'],
      ['Mixing the side and angle classifications', 'A triangle gets two labels, not one.'],
    ],
  },
  {
    slug: 'area-perimeter-advanced',
    title: 'Area & Perimeter (Advanced)',
    blurb: 'Using formulas, working with composite shapes, and solving real word problems. The same two ideas as Grade 3, just more layered.',
    learn: [
      ['Use the rectangle area formula', 'Length × width.'],
      ['Find the perimeter of any polygon', 'Add up every side.'],
      ['Break composite shapes into rectangles', 'Find each piece, then add or subtract.'],
      ['Solve word problems with area and perimeter', 'Decide which one the situation needs.'],
    ],
    examples: [
      { q: 'A 9 × 6 rectangle. Area?', a: '54 sq units.' },
      { q: 'An L-shape: 4×3 next to 2×5. Total area?', a: '22 sq units.' },
      { q: 'A garden 8 m by 5 m needs a fence. How much?', a: '26 m.' },
    ],
    slips: [
      ['Double-counting shared edges', 'When breaking a composite shape — only count outer sides for perimeter.'],
      ['Picking the wrong operation', 'Reading "fence" and using area instead of perimeter.'],
    ],
  },
  {
    slug: 'data-line-plots',
    title: 'Data & Line Plots',
    blurb: 'Reading and creating data displays — including line plots that show fractional values. Asking what the data actually says is the real skill.',
    learn: [
      ['Make a line plot with fractional data', 'A scale with halves or quarters, marked with Xs.'],
      ['Read complex bar graphs', 'Mind the scale — bars can be misread fast.'],
      ['Compare two data sets', 'Look at the shape, not just the totals.'],
      ['Answer questions like "how many more" or "what was the most"', 'Always tie the answer back to the data.'],
    ],
    examples: [
      { q: 'A line plot has 3 Xs at 1/4 and 2 Xs at 1/2. Total students?', a: '5' },
      { q: 'A graph shows soccer 14 and basketball 9. How many more?', a: '5' },
      { q: 'Which is the most common value? 3, 5, 5, 7, 5, 9.', a: '5' },
    ],
    slips: [
      ['Counting symbols, not values', 'Two students with shoe size 7 is not the same as one with size 14.'],
      ['Misreading a skipped scale', 'A graph going 0, 10, 20 reads differently than 0, 1, 2.'],
    ],
  },
  {
    slug: 'patterns-rules',
    title: 'Patterns & Rules',
    blurb: 'Generating a pattern from a rule, finding a rule from a pattern, and solving for a missing number in a simple equation.',
    learn: [
      ['Generate a pattern from a rule', 'Apply the rule again and again.'],
      ['Find features of a pattern', 'Always even? Always odd? Increasing fast?'],
      ['Read input/output tables', 'A rule turns each input into its output.'],
      ['Solve equations with a missing number', '8 × ? = 56 — what fills the blank?'],
    ],
    examples: [
      { q: 'Rule: ×3. Start: 2. First five terms?', a: '2, 6, 18, 54, 162' },
      { q: '8 × ? = 56. What is ?', a: '7' },
      { q: 'Input/output: 3→7, 5→9, 8→12. Rule?', a: 'Add 4.' },
    ],
    slips: [
      ['Confusing "+ rule" with "× rule"', 'A pattern that grows fast is usually multiplying.'],
      ['Solving for the wrong slot', 'Mixing up which number is the input and which is the output.'],
    ],
  },
];

// ─── QUESTION BANKS ─────────────────────────────────────────────────────────
// Seeded PRNG so question banks are stable across builds
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const randInt = (rng, lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo;
const gcdN = (a, b) => b === 0 ? a : gcdN(b, a % b);

const banks = {
  'place-value': (rng) => {
    const qs = [];
    for (let i = 0; i < 7; i++) {
      const n = randInt(rng, 100, 999);
      const digits = String(n).split('').map(Number);
      const pos = randInt(rng, 0, 2);
      const placeVal = digits[pos] * Math.pow(10, 2 - pos);
      qs.push({ q: `What is the value of the ${digits[pos]} in ${n}?`, a: String(placeVal),
        hints: ['Find which place that digit is in.', 'Hundreds, tens, or ones — what column?'] });
    }
    for (let i = 0; i < 4; i++) {
      const n = randInt(rng, 100, 999);
      const round = Math.round(n / 10) * 10;
      qs.push({ q: `Round ${n} to the nearest 10.`, a: String(round),
        hints: ['Look at the ones digit.', 'If it is 5 or more, round up.'] });
    }
    for (let i = 0; i < 4; i++) {
      const n = randInt(rng, 150, 950);
      const round = Math.round(n / 100) * 100;
      qs.push({ q: `Round ${n} to the nearest 100.`, a: String(round),
        hints: ['Look at the tens digit.', 'If it is 5 or more, round up.'] });
    }
    return qs;
  },

  'addition-subtraction': (rng) => {
    const qs = [];
    for (let i = 0; i < 8; i++) {
      const a = randInt(rng, 100, 800);
      const b = randInt(rng, 50, 350);
      qs.push({ q: `${a} + ${b}`, a: String(a + b),
        hints: ['Add ones first, then tens, then hundreds.', 'Remember to carry when a column passes 9.'] });
    }
    for (let i = 0; i < 7; i++) {
      const a = randInt(rng, 400, 900);
      const b = randInt(rng, 100, 380);
      qs.push({ q: `${a} − ${b}`, a: String(a - b),
        hints: ['Line up the place values.', 'Borrow from the next column if you need to.'] });
    }
    return qs;
  },

  multiplication: (rng) => {
    const qs = [];
    for (let i = 0; i < 12; i++) {
      const a = randInt(rng, 2, 10);
      const b = randInt(rng, 2, 10);
      qs.push({ q: `${a} × ${b}`, a: String(a * b),
        hints: [`Think of ${a} groups of ${b}.`, `Try skip-counting by ${b}.`] });
    }
    qs.push({ q: '4 × 0', a: '0', hints: ['Anything times zero is zero.'] });
    qs.push({ q: '9 × 1', a: '9', hints: ['Anything times one stays itself.'] });
    qs.push({ q: '7 × 10', a: '70', hints: ['Multiplying by 10 — add a zero.'] });
    return qs;
  },

  division: (rng) => {
    const qs = [];
    for (let i = 0; i < 11; i++) {
      const b = randInt(rng, 2, 9);
      const ans = randInt(rng, 2, 10);
      qs.push({ q: `${b * ans} ÷ ${b}`, a: String(ans),
        hints: [`${b} times what gives ${b * ans}?`, 'Use the times tables you know.'] });
    }
    qs.push({ q: '0 ÷ 5', a: '0', hints: ['Zero shared is still zero.'] });
    qs.push({ q: '8 ÷ 1', a: '8', hints: ['Divided by 1 — same as itself.'] });
    qs.push({ q: '40 ÷ 8', a: '5', hints: ['What is 8 × 5?'] });
    qs.push({ q: '12 ÷ 4', a: '3', hints: ['How many 4s make 12?'] });
    return qs;
  },

  fractions: (rng) => {
    return [
      { q: 'Which is larger: 1/2 or 1/4?', a: '1/2', hints: ['Fewer pieces means each one is bigger.'] },
      { q: 'Which is larger: 1/3 or 1/6?', a: '1/3', hints: ['Smaller bottom number = bigger piece.'] },
      { q: 'Is 2/4 the same as 1/2?', a: ['yes', '1/2'], hints: ['Try simplifying 2/4.'] },
      { q: 'Is 3/6 equal to 1/2?', a: ['yes', '1/2'], hints: ['Both numbers divide by 3.'] },
      { q: 'What is the numerator in 3/8?', a: '3', hints: ['Top number is the numerator.'] },
      { q: 'What is the denominator in 5/9?', a: '9', hints: ['Bottom number is the denominator.'] },
      { q: 'Write 1/2 as an equivalent fraction with denominator 6.', a: '3/6', hints: ['Multiply top and bottom by 3.'] },
      { q: 'Write 1/4 as an equivalent fraction with denominator 8.', a: '2/8', hints: ['Multiply top and bottom by 2.'] },
      { q: 'Which is larger: 3/5 or 2/5?', a: '3/5', hints: ['Same bottom — compare tops.'] },
      { q: 'Which is smaller: 5/8 or 7/8?', a: '5/8', hints: ['Same bottom — smaller top wins.'] },
      { q: 'What fraction is shaded if 3 of 4 equal parts are colored?', a: '3/4', hints: ['Top: shaded. Bottom: total parts.'] },
      { q: 'What fraction is shaded if 2 of 6 equal parts are colored?', a: '2/6', hints: ['Two shaded out of six total.'] },
      { q: 'Is 1/3 bigger or smaller than 1/2?', a: 'smaller', hints: ['Halves are bigger than thirds.'] },
      { q: 'How many fourths make a whole?', a: '4', hints: ['1/4 + 1/4 + 1/4 + 1/4 = 1.'] },
      { q: 'How many eighths make a whole?', a: '8', hints: ['Eight pieces of size 1/8.'] },
    ];
  },

  measurement: () => [
    { q: 'What unit measures the length of a pencil?', a: ['cm', 'centimeters', 'centimetres'], hints: ['Small object — use a small unit.'] },
    { q: 'What unit measures the distance between cities?', a: ['km', 'kilometers', 'kilometres'], hints: ['Big distance — use a big unit.'] },
    { q: 'How many cm are in 1 m?', a: '100', hints: ['Meter to centimeter — multiply by 100.'] },
    { q: 'How many g are in 1 kg?', a: '1000', hints: ['Kilo means thousand.'] },
    { q: 'How many mL are in 1 L?', a: '1000', hints: ['Liter to milliliter — multiply by 1000.'] },
    { q: 'Which is bigger: 1 L or 500 mL?', a: '1 L', hints: ['1 L is 1000 mL.'] },
    { q: 'Which is heavier: 1 kg or 500 g?', a: '1 kg', hints: ['1 kg is 1000 g.'] },
    { q: 'Estimate the mass of an apple in grams (closest to 150, 1500, or 15)?', a: '150', hints: ['Apples are light, but not feather-light.'] },
    { q: 'Estimate the length of a doorway in meters (closest to 0.2, 2, or 20)?', a: '2', hints: ['Doors are about as tall as a tall adult.'] },
    { q: 'How many cm in 3 m?', a: '300', hints: ['Multiply 3 by 100.'] },
    { q: 'How many g in 5 kg?', a: '5000', hints: ['Multiply 5 by 1000.'] },
    { q: 'How many mL in 2 L?', a: '2000', hints: ['Multiply 2 by 1000.'] },
    { q: 'What unit measures the mass of a backpack?', a: ['kg', 'kilograms'], hints: ['Heavier items use kg.'] },
    { q: 'What unit measures water in a glass?', a: ['mL', 'milliliters', 'millilitres'], hints: ['Small amounts of liquid.'] },
    { q: 'Which is shorter: 50 cm or 1 m?', a: '50 cm', hints: ['1 m is 100 cm.'] },
  ],

  time: () => [
    { q: 'A movie starts at 2:00 and ends at 3:30. How long is it (in minutes)?', a: '90', hints: ['1 hour 30 minutes.'] },
    { q: 'A class is from 9:15 to 10:00. How long is it (in minutes)?', a: '45', hints: ['From 9:15 to 10:00 — count up.'] },
    { q: 'School starts at 8:30 AM. Recess is 2 hours later. What time?', a: ['10:30', '10:30 am'], hints: ['Add 2 hours to 8:30.'] },
    { q: 'It is 7:48. How many minutes until 8:00?', a: '12', hints: ['Count up from 48 to 60.'] },
    { q: 'How many minutes are in 2 hours?', a: '120', hints: ['60 × 2.'] },
    { q: 'How many minutes are in half an hour?', a: '30', hints: ['Half of 60.'] },
    { q: 'How many seconds in a minute?', a: '60', hints: ['Same number as minutes in an hour.'] },
    { q: 'Is 11:00 AM morning or evening?', a: 'morning', hints: ['AM is before noon.'] },
    { q: 'Is 7:00 PM morning or evening?', a: 'evening', hints: ['PM is after noon.'] },
    { q: 'From 3:00 to 5:00 is how many hours?', a: '2', hints: ['5 minus 3.'] },
    { q: 'From 10:20 to 10:50 is how many minutes?', a: '30', hints: ['50 minus 20.'] },
    { q: 'From 2:45 to 3:00 is how many minutes?', a: '15', hints: ['Count up from 45 to 60.'] },
    { q: 'A 90 minute movie. How long in hours and minutes (write like 1h30)?', a: ['1h30', '1 hour 30 minutes', '1:30'], hints: ['90 = 60 + 30.'] },
    { q: 'A bus leaves at 6:15 PM. You arrive at 5:50 PM. How long until it leaves (in minutes)?', a: '25', hints: ['From 5:50 to 6:15.'] },
    { q: 'What time is 1 hour after 11:45?', a: ['12:45', '12:45 pm'], hints: ['Add an hour — the hour goes up by 1.'] },
  ],

  money: () => [
    { q: 'How much is 3 quarters? (in cents)', a: '75', hints: ['A quarter is 25¢.'] },
    { q: 'How much is 4 dimes? (in cents)', a: '40', hints: ['A dime is 10¢.'] },
    { q: 'How much is 7 nickels? (in cents)', a: '35', hints: ['A nickel is 5¢.'] },
    { q: 'How much is 2 quarters + 3 dimes? (in cents)', a: '80', hints: ['50 + 30.'] },
    { q: 'A toy costs $4.65. You pay $5.00. Change? (in dollars, like 0.35)', a: ['0.35', '$0.35', '35'], hints: ['$5 minus $4.65.'] },
    { q: 'A book is $1.75. You have $2.00. Change in cents?', a: '25', hints: ['$2 minus $1.75.'] },
    { q: 'How many quarters make $1?', a: '4', hints: ['Each is 25¢. 4 × 25 = 100.'] },
    { q: 'How many dimes make $1?', a: '10', hints: ['Each is 10¢.'] },
    { q: 'How many cents in $2.50?', a: '250', hints: ['Multiply by 100.'] },
    { q: '$3 + $1.50 = ? (in dollars)', a: ['4.50', '4.5', '$4.50'], hints: ['Add the dollars and the cents.'] },
    { q: '$5 − $2.75 = ? (in dollars)', a: ['2.25', '$2.25'], hints: ['Subtract carefully.'] },
    { q: 'A pack of pencils is $1.20. Two packs cost?', a: ['2.40', '$2.40'], hints: ['Double the price.'] },
    { q: 'Three quarters and one dime — total cents?', a: '85', hints: ['75 + 10.'] },
    { q: 'A juice is $2.30. You have a $5. Change in dollars?', a: ['2.70', '$2.70'], hints: ['$5 minus $2.30.'] },
    { q: 'You have 5 dimes and 3 nickels. Total cents?', a: '65', hints: ['50 + 15.'] },
  ],

  geometry: () => [
    { q: 'How many sides does a triangle have?', a: '3', hints: ['Tri means three.'] },
    { q: 'How many sides does a hexagon have?', a: '6', hints: ['Hex means six.'] },
    { q: 'How many sides does a pentagon have?', a: '5', hints: ['Penta means five.'] },
    { q: 'How many corners does a square have?', a: '4', hints: ['Same as the number of sides.'] },
    { q: 'How many faces does a cube have?', a: '6', hints: ['Top, bottom, and four sides.'] },
    { q: 'How many edges does a cube have?', a: '12', hints: ['Four on top, four on bottom, four going up.'] },
    { q: 'How many vertices does a cube have?', a: '8', hints: ['Four corners on top, four on bottom.'] },
    { q: 'A shape with all sides equal and 4 right angles is a?', a: 'square', hints: ['It is a special rectangle.'] },
    { q: 'A 3D shape that rolls smoothly with no edges is a?', a: 'sphere', hints: ['Like a ball.'] },
    { q: 'How many lines of symmetry does a square have?', a: '4', hints: ['Two diagonals plus the two midlines.'] },
    { q: 'How many lines of symmetry does a circle have?', a: ['infinite', 'many', 'unlimited'], hints: ['Any line through the center works.'] },
    { q: 'A flat shape with 4 sides where opposite sides are equal is a?', a: ['rectangle', 'parallelogram'], hints: ['Has 4 right angles if it is the most common type.'] },
    { q: 'How many faces does a cylinder have?', a: '3', hints: ['Top circle, bottom circle, and the curved side.'] },
    { q: 'A 3D shape that comes to a point with a circle base is a?', a: 'cone', hints: ['Like an ice-cream cone.'] },
    { q: 'How many sides does an octagon have?', a: '8', hints: ['Octo means eight.'] },
  ],

  'area-perimeter': () => [
    { q: 'Perimeter of a rectangle with sides 4 and 6?', a: '20', hints: ['Add all four sides.', '4 + 6 + 4 + 6.'] },
    { q: 'Area of a rectangle with sides 4 and 6?', a: '24', hints: ['Length times width.'] },
    { q: 'Perimeter of a square with side 7?', a: '28', hints: ['4 × 7.'] },
    { q: 'Area of a square with side 7?', a: '49', hints: ['7 × 7.'] },
    { q: 'Perimeter of a rectangle 8 by 3?', a: '22', hints: ['2 × (8 + 3).'] },
    { q: 'Area of a rectangle 8 by 3?', a: '24', hints: ['8 × 3.'] },
    { q: 'A square garden has side 5 m. Area in square meters?', a: '25', hints: ['5 × 5.'] },
    { q: 'A square garden has side 5 m. Perimeter in meters?', a: '20', hints: ['4 × 5.'] },
    { q: 'Perimeter of a triangle with sides 3, 4, 5?', a: '12', hints: ['Add all three sides.'] },
    { q: 'Perimeter of a hexagon with all sides 4?', a: '24', hints: ['6 × 4.'] },
    { q: 'Area of a 10 by 2 rectangle?', a: '20', hints: ['10 × 2.'] },
    { q: 'Perimeter of a 10 by 2 rectangle?', a: '24', hints: ['2 × (10 + 2).'] },
    { q: 'Area of a 6 by 6 square?', a: '36', hints: ['6 × 6.'] },
    { q: 'Perimeter of a rectangle 9 by 1?', a: '20', hints: ['2 × (9 + 1).'] },
    { q: 'A book cover is 20 cm by 15 cm. Area in sq cm?', a: '300', hints: ['20 × 15.'] },
  ],

  'data-graphs': () => [
    { q: 'A pictograph: 4 stars for apples, each star = 5. How many apples?', a: '20', hints: ['4 × 5.'] },
    { q: 'A bar graph: dogs at 8, cats at 5. How many more dogs?', a: '3', hints: ['8 minus 5.'] },
    { q: 'A tally with 3 groups of 5 and 2 extra marks. Total?', a: '17', hints: ['15 + 2.'] },
    { q: 'A pictograph: 6 symbols, each = 10. Total?', a: '60', hints: ['6 × 10.'] },
    { q: 'On a bar graph, the bar for red reaches 12. The bar for blue reaches 7. Total red and blue?', a: '19', hints: ['12 + 7.'] },
    { q: 'Most common color in: red, blue, red, green, red, blue?', a: 'red', hints: ['Count each color.'] },
    { q: 'A tally with 4 groups of 5. Total?', a: '20', hints: ['4 × 5.'] },
    { q: 'A bar graph: A is 9, B is 14, C is 6. Which is tallest?', a: 'B', hints: ['Highest number.'] },
    { q: 'A pictograph: 2.5 symbols, each = 4. Total?', a: '10', hints: ['2.5 × 4.'] },
    { q: 'Total of 7, 3, 5, 4, 6?', a: '25', hints: ['Add them all.'] },
    { q: 'Smallest of 12, 7, 19, 3, 8?', a: '3', hints: ['Look for the smallest number.'] },
    { q: 'Largest of 6, 11, 4, 9, 2?', a: '11', hints: ['Look for the biggest.'] },
    { q: 'Difference between largest and smallest of 14, 8, 6, 20, 11?', a: '14', hints: ['20 minus 6.'] },
    { q: 'A bar graph: Monday 5, Tuesday 8. Total over 2 days?', a: '13', hints: ['5 + 8.'] },
    { q: 'A pictograph: 0.5 of a symbol where each = 10. Value?', a: '5', hints: ['Half of 10.'] },
  ],

  patterns: () => [
    { q: 'Next in: 3, 6, 9, 12, ?', a: '15', hints: ['Rule is +3.'] },
    { q: 'Next in: 2, 4, 8, 16, ?', a: '32', hints: ['Rule is ×2.'] },
    { q: 'Next in: 5, 10, 15, 20, ?', a: '25', hints: ['Rule is +5.'] },
    { q: 'Next in: 1, 4, 7, 10, ?', a: '13', hints: ['Rule is +3.'] },
    { q: 'Next in: 100, 90, 80, 70, ?', a: '60', hints: ['Rule is −10.'] },
    { q: 'Rule is +4. After 7, what is next?', a: '11', hints: ['7 + 4.'] },
    { q: 'Rule is ×3. After 4, what is next?', a: '12', hints: ['4 × 3.'] },
    { q: 'Rule is −2. After 18, what is next?', a: '16', hints: ['18 − 2.'] },
    { q: 'Next in: 1, 2, 4, 7, 11, ?', a: '16', hints: ['Differences grow by 1.'] },
    { q: 'Next in: 50, 45, 40, 35, ?', a: '30', hints: ['Rule is −5.'] },
    { q: 'Next in: A, B, A, B, A, ?', a: 'B', hints: ['Pattern alternates.'] },
    { q: 'Next in: 11, 22, 33, 44, ?', a: '55', hints: ['Rule is +11.'] },
    { q: 'Rule: add 6. Output for 9?', a: '15', hints: ['9 + 6.'] },
    { q: 'Rule: subtract 3. Output for 20?', a: '17', hints: ['20 − 3.'] },
    { q: 'Next in: 0, 5, 10, 15, ?', a: '20', hints: ['Rule is +5.'] },
  ],

  // Grade 4 banks
  'place-value-large': (rng) => {
    const qs = [];
    for (let i = 0; i < 6; i++) {
      const n = randInt(rng, 10000, 99999);
      const round = Math.round(n / 1000) * 1000;
      qs.push({ q: `Round ${n.toLocaleString()} to the nearest 1,000.`, a: String(round),
        hints: ['Look at the hundreds digit.'] });
    }
    for (let i = 0; i < 5; i++) {
      const n = randInt(rng, 1000, 9999);
      const digits = String(n).split('').map(Number);
      const pos = randInt(rng, 0, 3);
      const placeVal = digits[pos] * Math.pow(10, 3 - pos);
      qs.push({ q: `What is the value of the ${digits[pos]} in ${n.toLocaleString()}?`, a: String(placeVal),
        hints: ['Which place is that digit in?'] });
    }
    qs.push({ q: 'Which is larger: 14,302 or 14,032?', a: '14,302', hints: ['Compare from the left.'] });
    qs.push({ q: 'Which is larger: 28,000 or 28,900?', a: '28,900', hints: ['Hundreds digit decides it.'] });
    qs.push({ q: 'Write 32,500 in expanded form (use + and spaces, like 30000 + 2000 + 500).', a: ['30000 + 2000 + 500', '30,000 + 2,000 + 500'], hints: ['Break each place value out.'] });
    qs.push({ q: 'What is 10,000 + 5,000 + 200 + 7?', a: '15207', hints: ['Just add them up.'] });
    return qs;
  },

  'multi-digit-add-sub': (rng) => {
    const qs = [];
    for (let i = 0; i < 8; i++) {
      const a = randInt(rng, 1000, 8000);
      const b = randInt(rng, 500, 3500);
      qs.push({ q: `${a.toLocaleString()} + ${b.toLocaleString()}`, a: String(a + b),
        hints: ['Line up by place value.'] });
    }
    for (let i = 0; i < 7; i++) {
      const a = randInt(rng, 5000, 9000);
      const b = randInt(rng, 1000, 4000);
      qs.push({ q: `${a.toLocaleString()} − ${b.toLocaleString()}`, a: String(a - b),
        hints: ['Borrow when you need to.'] });
    }
    return qs;
  },

  'multi-digit-multiplication': (rng) => {
    const qs = [];
    for (let i = 0; i < 8; i++) {
      const a = randInt(rng, 12, 99);
      const b = randInt(rng, 2, 9);
      qs.push({ q: `${a} × ${b}`, a: String(a * b), hints: ['Multiply each digit, then add.'] });
    }
    for (let i = 0; i < 7; i++) {
      const a = randInt(rng, 11, 30);
      const b = randInt(rng, 11, 30);
      qs.push({ q: `${a} × ${b}`, a: String(a * b), hints: ['Use the area model or standard algorithm.'] });
    }
    return qs;
  },

  'long-division': (rng) => {
    const qs = [];
    for (let i = 0; i < 9; i++) {
      const b = randInt(rng, 2, 9);
      const ans = randInt(rng, 11, 99);
      qs.push({ q: `${b * ans} ÷ ${b}`, a: String(ans), hints: ['Use the four-step cycle: divide, multiply, subtract, bring down.'] });
    }
    for (let i = 0; i < 6; i++) {
      const b = randInt(rng, 3, 8);
      const ans = randInt(rng, 11, 50);
      const rem = randInt(rng, 1, b - 1);
      const n = b * ans + rem;
      qs.push({ q: `${n} ÷ ${b} (write as "q remainder r")`, a: [`${ans} remainder ${rem}`, `${ans}r${rem}`, `${ans} r ${rem}`], hints: ['Find the largest whole number first.'] });
    }
    return qs;
  },

  'factors-multiples': () => [
    { q: 'Is 12 a multiple of 3?', a: 'yes', hints: ['3 × 4 = 12.'] },
    { q: 'Is 17 prime?', a: 'yes', hints: ['Try dividing by 2, 3, 5, 7.'] },
    { q: 'Is 21 prime?', a: 'no', hints: ['3 × 7 = 21.'] },
    { q: 'List factors of 6 (comma separated, low to high).', a: ['1, 2, 3, 6', '1,2,3,6'], hints: ['Numbers that divide it evenly.'] },
    { q: 'List factors of 10 (comma separated, low to high).', a: ['1, 2, 5, 10', '1,2,5,10'], hints: ['1 and the number itself always count.'] },
    { q: 'First five multiples of 4 (comma separated)?', a: ['4, 8, 12, 16, 20', '4,8,12,16,20'], hints: ['Start with 4, keep adding 4.'] },
    { q: 'First five multiples of 7 (comma separated)?', a: ['7, 14, 21, 28, 35', '7,14,21,28,35'], hints: ['7 times 1, 2, 3, 4, 5.'] },
    { q: 'Is 1 prime?', a: 'no', hints: ['A prime needs exactly two factors.'] },
    { q: 'Smallest prime number?', a: '2', hints: ['Only 1 and itself divide it.'] },
    { q: 'Is 15 prime or composite?', a: 'composite', hints: ['3 × 5 = 15.'] },
    { q: 'Is 11 prime or composite?', a: 'prime', hints: ['Try dividing by 2, 3, 5.'] },
    { q: 'Common factor of 6 and 9?', a: '3', hints: ['Both divide by what number?'] },
    { q: 'Common factor of 8 and 12?', a: '4', hints: ['Highest number that divides both.'] },
    { q: 'Is 25 a multiple of 5?', a: 'yes', hints: ['5 × 5 = 25.'] },
    { q: 'How many factors does 16 have?', a: '5', hints: ['1, 2, 4, 8, 16.'] },
  ],

  'fractions-advanced': () => [
    { q: '2/5 + 1/5 = ?', a: '3/5', hints: ['Same bottom — add the tops.'] },
    { q: '3/8 + 2/8 = ?', a: '5/8', hints: ['Add the tops.'] },
    { q: '5/6 − 1/6 = ?', a: ['4/6', '2/3'], hints: ['Subtract the tops.'] },
    { q: '1/2 + 1/4 = ?', a: '3/4', hints: ['Convert 1/2 to 2/4.'] },
    { q: '1/3 + 1/6 = ?', a: ['3/6', '1/2'], hints: ['Convert 1/3 to 2/6.'] },
    { q: 'Which is larger: 2/3 or 3/4?', a: '3/4', hints: ['Compare with denominator 12.'] },
    { q: '7/3 as a mixed number?', a: ['2 1/3', '2 and 1/3'], hints: ['How many whole threes fit?'] },
    { q: '9/4 as a mixed number?', a: ['2 1/4', '2 and 1/4'], hints: ['9 divided by 4 is 2 remainder 1.'] },
    { q: '2 × 1/4 = ?', a: ['2/4', '1/2'], hints: ['Two groups of 1/4.'] },
    { q: '3 × 1/5 = ?', a: '3/5', hints: ['Three groups of 1/5.'] },
    { q: '2/3 as a fraction with denominator 6?', a: '4/6', hints: ['Multiply top and bottom by 2.'] },
    { q: '1 1/2 as an improper fraction?', a: '3/2', hints: ['2/2 + 1/2.'] },
    { q: '2 1/4 as an improper fraction?', a: '9/4', hints: ['8/4 + 1/4.'] },
    { q: '4/8 simplified?', a: '1/2', hints: ['Both divide by 4.'] },
    { q: '6/9 simplified?', a: '2/3', hints: ['Both divide by 3.'] },
  ],

  decimals: () => [
    { q: 'Write 0.5 as a fraction.', a: ['1/2', '5/10'], hints: ['Five tenths.'] },
    { q: 'Write 0.25 as a fraction.', a: ['1/4', '25/100'], hints: ['Twenty-five hundredths.'] },
    { q: 'Write 3/4 as a decimal.', a: '0.75', hints: ['Three quarters.'] },
    { q: 'Write 1/2 as a decimal.', a: '0.5', hints: ['Half.'] },
    { q: 'Which is larger: 0.3 or 0.27?', a: '0.3', hints: ['0.3 is 0.30.'] },
    { q: 'Which is larger: 0.5 or 0.45?', a: '0.5', hints: ['Compare tenths first.'] },
    { q: '0.4 + 0.3 = ?', a: '0.7', hints: ['Add the tenths.'] },
    { q: '0.8 − 0.5 = ?', a: '0.3', hints: ['Subtract the tenths.'] },
    { q: '1.5 + 0.5 = ?', a: ['2', '2.0'], hints: ['Half plus half is one.'] },
    { q: '2.4 − 1.2 = ?', a: ['1.2'], hints: ['Subtract whole and decimal parts.'] },
    { q: 'Round 0.47 to the nearest tenth.', a: '0.5', hints: ['Look at the hundredths.'] },
    { q: 'Round 0.32 to the nearest tenth.', a: '0.3', hints: ['Hundredths digit is 2 — round down.'] },
    { q: '0.1 + 0.9 = ?', a: ['1', '1.0'], hints: ['One whole.'] },
    { q: 'What is 0.6 as a fraction?', a: ['6/10', '3/5'], hints: ['Six tenths.'] },
    { q: '0.9 − 0.4 = ?', a: '0.5', hints: ['Nine tenths minus four tenths.'] },
  ],

  'measurement-conversions': () => [
    { q: 'How many cm in 2.5 m?', a: '250', hints: ['Multiply by 100.'] },
    { q: 'How many m in 350 cm?', a: ['3.5', '3.50'], hints: ['Divide by 100.'] },
    { q: 'How many g in 3.2 kg?', a: '3200', hints: ['Multiply by 1000.'] },
    { q: 'How many kg in 2500 g?', a: ['2.5', '2.50'], hints: ['Divide by 1000.'] },
    { q: 'How many mL in 1.5 L?', a: '1500', hints: ['Multiply by 1000.'] },
    { q: 'How many L in 750 mL?', a: ['0.75', '.75'], hints: ['Divide by 1000.'] },
    { q: 'A 90° angle is called?', a: ['right', 'right angle'], hints: ['Like the corner of a square.'] },
    { q: 'An angle less than 90° is called?', a: ['acute', 'acute angle'], hints: ['"A cute little angle."'] },
    { q: 'An angle between 90° and 180° is called?', a: ['obtuse', 'obtuse angle'], hints: ['Bigger than a right angle.'] },
    { q: 'A 180° angle is called?', a: ['straight', 'straight angle'], hints: ['Forms a straight line.'] },
    { q: 'How many cm in 7 m?', a: '700', hints: ['7 × 100.'] },
    { q: 'How many minutes in 3 hours?', a: '180', hints: ['3 × 60.'] },
    { q: 'How many g in 4.5 kg?', a: '4500', hints: ['4.5 × 1000.'] },
    { q: '500 mL + 250 mL = ? mL', a: '750', hints: ['Just add.'] },
    { q: '2 m + 30 cm in cm?', a: '230', hints: ['Convert m to cm first.'] },
  ],

  'time-elapsed': () => [
    { q: 'From 10:45 AM to 1:20 PM, how long? (write as "h m" like "2h 35")', a: ['2h 35', '2 hours 35 minutes', '2:35'], hints: ['Count hours, then minutes.'] },
    { q: 'How many minutes in 3 hours?', a: '180', hints: ['3 × 60.'] },
    { q: 'A movie is 105 minutes. How long in hours and minutes (like "1h 45")?', a: ['1h 45', '1 hour 45 minutes', '1:45'], hints: ['105 = 60 + 45.'] },
    { q: 'From 8:00 AM to 12:00 PM, how many hours?', a: '4', hints: ['Just count from 8 to 12.'] },
    { q: 'From 6:30 to 7:00, how many minutes?', a: '30', hints: ['Count from 30 to 60.'] },
    { q: 'How many seconds in 5 minutes?', a: '300', hints: ['5 × 60.'] },
    { q: 'How many hours in 2 days?', a: '48', hints: ['2 × 24.'] },
    { q: 'From 11:30 AM to 1:15 PM, in minutes?', a: '105', hints: ['1 hour 45 minutes = 105 minutes.'] },
    { q: 'A class runs 50 minutes. Starts at 9:20. Ends at?', a: ['10:10', '10:10 am'], hints: ['9:20 + 50 minutes.'] },
    { q: 'How many minutes in 1.5 hours?', a: '90', hints: ['60 + 30.'] },
    { q: 'A 2-hour movie starts at 5:30 PM. Ends at?', a: ['7:30', '7:30 pm'], hints: ['Add 2 hours.'] },
    { q: '180 seconds is how many minutes?', a: '3', hints: ['180 ÷ 60.'] },
    { q: 'From 3:50 PM to 4:10 PM, in minutes?', a: '20', hints: ['Count from 50 to 70.'] },
    { q: 'A nap from 1:15 PM to 2:45 PM. How long (like "1h 30")?', a: ['1h 30', '1 hour 30 minutes', '1:30'], hints: ['1 hour 30 minutes.'] },
    { q: 'How many days in 72 hours?', a: '3', hints: ['72 ÷ 24.'] },
  ],

  'geometry-lines-angles': () => [
    { q: 'Two lines that never cross are?', a: 'parallel', hints: ['They stay the same distance apart.'] },
    { q: 'Two lines that meet at 90° are?', a: 'perpendicular', hints: ['They form right angles.'] },
    { q: 'A triangle with three equal sides is?', a: 'equilateral', hints: ['"Equi" means equal.'] },
    { q: 'A triangle with two equal sides is?', a: 'isosceles', hints: ['Iso means same.'] },
    { q: 'A triangle with all sides different is?', a: 'scalene', hints: ['No matching sides.'] },
    { q: 'A triangle with one 90° angle is?', a: 'right', hints: ['Has one right angle.'] },
    { q: 'A triangle with all angles less than 90° is?', a: 'acute', hints: ['All three are acute.'] },
    { q: 'A triangle with one obtuse angle is?', a: 'obtuse', hints: ['One angle is over 90°.'] },
    { q: 'How many sides does a quadrilateral have?', a: '4', hints: ['Quad means four.'] },
    { q: 'A 4-sided shape with opposite sides parallel is a?', a: ['parallelogram'], hints: ['"Para" — parallel.'] },
    { q: 'A rectangle with all sides equal is a?', a: 'square', hints: ['Special rectangle.'] },
    { q: 'A four-sided shape with exactly one pair of parallel sides is a?', a: 'trapezoid', hints: ['Like a slanted rectangle.'] },
    { q: 'A line that goes on forever both ways is a?', a: 'line', hints: ['Different from a ray.'] },
    { q: 'A line with one endpoint is a?', a: 'ray', hints: ['Like a beam of light.'] },
    { q: 'A piece of a line with two endpoints is a?', a: ['line segment', 'segment'], hints: ['Has a start and end.'] },
  ],

  'area-perimeter-advanced': (rng) => {
    const qs = [];
    for (let i = 0; i < 6; i++) {
      const l = randInt(rng, 5, 15);
      const w = randInt(rng, 2, 10);
      qs.push({ q: `Area of a ${l} × ${w} rectangle?`, a: String(l * w), hints: ['Length × width.'] });
    }
    for (let i = 0; i < 5; i++) {
      const l = randInt(rng, 4, 14);
      const w = randInt(rng, 2, 9);
      qs.push({ q: `Perimeter of a ${l} × ${w} rectangle?`, a: String(2 * (l + w)), hints: ['2 × (l + w).'] });
    }
    qs.push({ q: 'A garden is 12 m by 5 m. Fence needed (perimeter)?', a: '34', hints: ['2 × (12 + 5).'] });
    qs.push({ q: 'A garden is 12 m by 5 m. Carpet needed (area)?', a: '60', hints: ['12 × 5.'] });
    qs.push({ q: 'An L-shape: 4×3 rectangle next to 2×5 rectangle. Total area?', a: '22', hints: ['12 + 10.'] });
    qs.push({ q: 'A square has area 36. Side length?', a: '6', hints: ['6 × 6 = 36.'] });
    return qs;
  },

  'data-line-plots': () => [
    { q: 'A line plot: 3 Xs at 1/4, 2 Xs at 1/2. Total students?', a: '5', hints: ['3 + 2.'] },
    { q: 'Largest value: 4, 7, 2, 9, 5?', a: '9', hints: ['Look for the biggest.'] },
    { q: 'Smallest value: 4, 7, 2, 9, 5?', a: '2', hints: ['Look for the smallest.'] },
    { q: 'Range of 4, 7, 2, 9, 5? (largest minus smallest)', a: '7', hints: ['9 minus 2.'] },
    { q: 'Most common in: 3, 5, 5, 7, 5, 9?', a: '5', hints: ['Count each one.'] },
    { q: 'Sum of 2, 4, 6, 8, 10?', a: '30', hints: ['Add them up.'] },
    { q: 'A bar graph: soccer 14, basketball 9, tennis 6. Total kids?', a: '29', hints: ['14 + 9 + 6.'] },
    { q: 'On a bar graph, the difference between bars at 18 and 11?', a: '7', hints: ['18 − 11.'] },
    { q: 'Average of 4, 6, 8 (mean)?', a: '6', hints: ['Add them, divide by 3.'] },
    { q: 'Mean of 5, 10, 15?', a: '10', hints: ['Sum is 30, divide by 3.'] },
    { q: 'A line plot with values 1/4, 1/2, 1/2, 3/4 — how many data points?', a: '4', hints: ['Count the Xs.'] },
    { q: 'Mode of 2, 3, 3, 5, 7, 3?', a: '3', hints: ['Most frequent.'] },
    { q: 'Median of 1, 3, 5, 7, 9?', a: '5', hints: ['Middle number when ordered.'] },
    { q: 'Total of: red 4, blue 7, green 3?', a: '14', hints: ['Add all three.'] },
    { q: 'On a pictograph, 3 symbols where each = 6. Value?', a: '18', hints: ['3 × 6.'] },
  ],

  'patterns-rules': () => [
    { q: 'Rule: ×3. First five terms starting from 2?', a: ['2, 6, 18, 54, 162', '2,6,18,54,162'], hints: ['Multiply each by 3.'] },
    { q: 'Rule: +4. Output for 9?', a: '13', hints: ['9 + 4.'] },
    { q: 'Rule: −5. Output for 22?', a: '17', hints: ['22 − 5.'] },
    { q: '8 × ? = 56. Find ?', a: '7', hints: ['7 × 8 = 56.'] },
    { q: '? × 6 = 42. Find ?', a: '7', hints: ['7 × 6 = 42.'] },
    { q: '? ÷ 4 = 9. Find ?', a: '36', hints: ['9 × 4 = 36.'] },
    { q: 'Input/output: 3→7, 5→9, 8→12. Rule?', a: ['add 4', '+4'], hints: ['Output is input + something.'] },
    { q: 'Input/output: 2→6, 4→12, 5→15. Rule?', a: ['times 3', '×3', '*3'], hints: ['Output is input × something.'] },
    { q: 'Next in: 1, 3, 6, 10, 15, ?', a: '21', hints: ['Differences grow by 1 each time.'] },
    { q: 'Next in: 80, 70, 60, 50, ?', a: '40', hints: ['Rule is −10.'] },
    { q: 'Rule: ×5. Output for 6?', a: '30', hints: ['6 × 5.'] },
    { q: 'Rule: ÷2. Output for 24?', a: '12', hints: ['24 ÷ 2.'] },
    { q: '24 = ? × 6. Find ?', a: '4', hints: ['What times 6 is 24?'] },
    { q: '50 = 5 × ?. Find ?', a: '10', hints: ['5 × 10.'] },
    { q: 'Next in: 100, 200, 400, 800, ?', a: '1600', hints: ['Doubles each step.'] },
  ],
};

function buildQuestionsFor(slug, gradeIndex) {
  const fn = banks[slug];
  if (!fn) return [];
  // Seed deterministically per slug
  const seed = slug.split('').reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 17);
  const rng = mulberry32(seed >>> 0);
  return fn(rng).slice(0, 15);
}

// ─── PAGE TEMPLATES ────────────────────────────────────────────────────────
const pageHead = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — Pebble</title>
${FONT_LINK}
<link rel="stylesheet" href="../styles.css" />
</head>
<body>
<div class="grain"></div>`;

const indexHead = (title) => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${title} — Pebble</title>
${FONT_LINK}
<link rel="stylesheet" href="styles.css" />
</head>
<body>
<div class="grain"></div>`;

function topicPage(t, gradeLabel, prev, next) {
  const learnLis = t.learn.map(([title, desc], i) =>
    `<li><span class="n">${String(i+1).padStart(2, '0')}</span><div><strong>${title}</strong><p>${desc}</p></div></li>`
  ).join('\n      ');

  const exampleEls = t.examples.map((e) =>
    `<div class="example"><div class="q">${e.q}</div><div class="a">${e.a}</div></div>`
  ).join('\n      ');

  const slipEls = t.slips.map((s, i) =>
    `<div class="slip"><div class="num">${String(i+1).padStart(2, '0')}</div><h4>${s[0]}</h4><p>${s[1]}</p></div>`
  ).join('\n      ');

  const prevHTML = prev
    ? `<a href="${prev.slug}.html"><span class="label">PREV</span><span>${prev.title}</span></a>`
    : `<a href="../topics.html"><span class="label">BACK</span><span>All topics</span></a>`;
  const nextHTML = next
    ? `<a class="next" href="${next.slug}.html"><span class="label">NEXT</span><span>${next.title}</span></a>`
    : `<a class="next" href="../topics.html"><span class="label">DONE</span><span>All topics</span></a>`;

  return `${pageHead(t.title)}
${NAV('../styles.css', '../index.html', '../topics.html')}

<main class="wrap">
  <section class="topic-page-hero">
    <div class="crumbs">
      <a href="../index.html">Home</a><span class="sep">/</span>
      <a href="../topics.html">Topics</a><span class="sep">/</span>
      <span>${gradeLabel}</span><span class="sep">/</span>
      <span>${t.title}</span>
    </div>
    <span class="eyebrow"><span class="eyebrow-dot"></span> ${gradeLabel}</span>
    <h1>${t.title}.</h1>
    <p>${t.blurb}</p>
  </section>

  <section class="topic-body">
    <div>
      <div class="section-tag">What you&rsquo;ll learn</div>
      <h2 style="margin-bottom:1.5rem;">The skills inside this topic.</h2>
      <ul class="learn-list">
      ${learnLis}
      </ul>
    </div>

    <aside class="example-card">
      <div class="section-tag">Try these</div>
      <h3>Quick examples</h3>
      <div class="sub">Read the question, think it through, then peek at the answer.</div>
      ${exampleEls}
    </aside>
  </section>

  <section class="section">
    <div class="section-head">
      <div class="section-tag">Common slip-ups</div>
      <h2>The mistakes most kids make here.</h2>
      <p>Knowing the trap is half of avoiding it. If you catch yourself doing one of these, slow down — it just means the concept is still settling.</p>
    </div>
    <div class="slips">
      ${slipEls}
    </div>
  </section>

  <section class="next-row">
    ${prevHTML}
    ${nextHTML}
  </section>
</main>

${FOOTER}
</body>
</html>`;
}

function coursePage(t, gradeLabel, questions) {
  const dataJson = JSON.stringify({ slug: t.slug, title: t.title, grade: gradeLabel, questions }, null, 0);
  return `${pageHead(t.title + ' — Course')}
${NAV('../styles.css', '../index.html', '../topics.html')}

<main class="wrap">
  <section class="course-hero">
    <div class="crumbs">
      <a href="../index.html">Home</a><span class="sep">/</span>
      <a href="../courses.html">Courses</a><span class="sep">/</span>
      <span>${gradeLabel}</span><span class="sep">/</span>
      <span>${t.title}</span>
    </div>
    <span class="eyebrow"><span class="eyebrow-dot"></span> ${gradeLabel} &middot; ${questions.length} questions</span>
    <h1>${t.title}.</h1>
    <p>${t.blurb}</p>
  </section>

  <section class="mode-bar">
    <div class="mode-chips" id="mode-chips" role="tablist" aria-label="Course mode">
      <button data-mode="practice" type="button" role="tab">Practice</button>
      <button data-mode="assessment" type="button" role="tab">Assessment</button>
      <button data-mode="flashcards" type="button" role="tab">Flashcards</button>
      <button data-mode="speed" type="button" role="tab">Speed</button>
    </div>
    <div class="mode-bar-right">
      <button class="pro-toggle" id="course-pro-toggle" type="button" role="switch" aria-checked="false" title="Poly Pro uses AI for more flexible hints">
        <span class="pro-dot"></span><span class="pro-label">Pro</span>
      </button>
      <div class="mode-meta" id="mode-meta">Poly chats and gives hints as you go</div>
    </div>
  </section>

  <section id="screen-quiz">
    <div class="chat-shell">
      <div class="chat-shell-head">
        <div class="csh-who">
          <span class="csh-avatar" aria-hidden="true">
            <svg viewBox="0 0 120 110" style="color:#2f6f4e"><use href="#poly-svg" /></svg>
          </span>
          <div>
            <strong>Poly</strong>
            <span class="csh-sub" id="csh-progress">Question 1 of ${questions.length}</span>
          </div>
        </div>
        <div class="csh-score" id="csh-score">0 right</div>
      </div>
      <div class="chat-shell-stream" id="chat-stream" aria-live="polite"></div>
      <form class="chat-shell-bar" id="q-form">
        <input class="chat-shell-input" id="q-input" autocomplete="off" inputmode="text" placeholder="Type your answer to Poly…" />
        <button class="chat-shell-send" id="q-send" type="submit" aria-label="Send">&rarr;</button>
      </form>
      <div class="chat-shell-actions" id="chat-actions">
        <button class="csa-chip" data-act="hint" type="button">Need a hint</button>
        <button class="csa-chip" data-act="stuck" type="button">I&rsquo;m stuck</button>
        <button class="csa-chip" data-act="skip" type="button">Skip</button>
      </div>
    </div>
  </section>

  <!-- Flashcards -->
  <section id="screen-flash" style="display:none;">
    <div class="flash-wrap">
      <div class="flash-top">
        <span class="flash-count" id="flash-count">Card 1 of ${questions.length}</span>
        <span class="flash-tally" id="flash-tally">0 got it</span>
      </div>
      <div class="flashcard" id="flashcard">
        <div class="flash-inner">
          <div class="flash-face flash-front">
            <span class="flash-label">Question</span>
            <p class="flash-q mono" id="flash-q"></p>
          </div>
          <div class="flash-face flash-back">
            <span class="flash-label">Answer</span>
            <p class="flash-a mono" id="flash-a"></p>
            <p class="flash-yours" id="flash-yours"></p>
          </div>
        </div>
      </div>
      <form class="flash-inputbar" id="flash-form">
        <input class="chat-shell-input" id="flash-input" autocomplete="off" placeholder="Type your answer, then flip…" />
        <button class="chat-shell-send" id="flash-flip" type="submit" aria-label="Flip">Flip</button>
      </form>
      <div class="flash-actions" id="flash-rate" style="display:none;">
        <button class="csa-chip flash-good" data-rate="good" type="button">Got it</button>
        <button class="csa-chip flash-again" data-rate="again" type="button">Review again</button>
      </div>
    </div>
  </section>

  <!-- Speed -->
  <section id="screen-speed" style="display:none;">
    <div class="speed-wrap">
      <div class="speed-start" id="speed-start">
        <div class="section-tag">Speed mode</div>
        <h2>Race the clock.</h2>
        <p class="lede">60 seconds. Answer as many as you can — every right answer in a row adds <strong>+2 seconds</strong>. Ready?</p>
        <button class="speed-go" id="speed-go" type="button">Start the clock &rarr;</button>
      </div>

      <div class="speed-play" id="speed-play" style="display:none;">
        <div class="speed-hud">
          <div class="stopwatch">
            <svg viewBox="0 0 120 120" class="stopwatch-svg" aria-hidden="true">
              <circle class="sw-track" cx="60" cy="60" r="52" />
              <circle class="sw-prog" id="sw-prog" cx="60" cy="60" r="52" />
            </svg>
            <div class="stopwatch-num" id="speed-clock">60</div>
          </div>
          <div class="speed-stats">
            <div class="speed-score-big"><span id="speed-score">0</span><span class="speed-score-lbl">right</span></div>
            <span class="speed-streak" id="speed-streak"></span>
          </div>
        </div>
        <p class="speed-q mono" id="speed-q"></p>
        <form class="speed-form" id="speed-form">
          <input class="chat-shell-input" id="speed-input" autocomplete="off" inputmode="text" placeholder="Quick — type it!" />
          <button class="chat-shell-send" id="speed-send" type="submit" aria-label="Send">&rarr;</button>
        </form>
        <div class="speed-flash" id="speed-flash"></div>
      </div>
    </div>
  </section>

  <section id="screen-result" style="display:none;">
    <div class="result-card">
      <div class="section-tag" id="result-tag">Course complete</div>
      <h2 id="result-title">How it went.</h2>
      <p class="lede" id="result-text"></p>
      <div id="result-list"></div>
      <div class="result-actions">
        <button id="result-restart" type="button">Try again</button>
        <a href="../courses.html">All courses</a>
      </div>
    </div>
  </section>
</main>

<!-- Poly slime symbol for the chat avatar -->
<svg width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    <symbol id="poly-svg" viewBox="0 0 120 110">
      <path fill="currentColor" d="M 60 8 C 88 8 108 30 110 58 C 111 80 100 104 60 104 C 20 104 9 80 10 58 C 12 30 32 8 60 8 Z" />
      <ellipse cx="38" cy="44" rx="11" ry="8" fill="#ffffff" opacity="0.28" />
      <ellipse cx="46" cy="58" rx="6" ry="8" fill="#14171c" />
      <ellipse cx="74" cy="58" rx="6" ry="8" fill="#14171c" />
      <path d="M 50 76 Q 60 86 70 76" fill="none" stroke="#14171c" stroke-width="3.5" stroke-linecap="round" />
      <ellipse cx="34" cy="72" rx="5" ry="3.5" fill="#e8a23a" opacity="0.4" />
      <ellipse cx="86" cy="72" rx="5" ry="3.5" fill="#e8a23a" opacity="0.4" />
    </symbol>
  </defs>
</svg>

${FOOTER}
<script>window.COURSE = ${dataJson};</script>
<script src="../courses.js"></script>
</body>
</html>`;
}

function coursesIndex(courseList) {
  const colHTML = (courses, label) => `
    <div class="grade-col">
      <div class="section-tag">${label}</div>
      <h2>${label === 'GRADE 3' ? 'Foundations' : 'Building on the basics'}</h2>
      <ul class="course-list">
      ${courses.map((c, i) =>
        `<li><a href="courses/${c.slug}.html"><span class="num">${String(i+1).padStart(2, '0')}</span><span>${c.title}</span><span class="meta">${c.count} q</span></a></li>`
      ).join('\n      ')}
      </ul>
    </div>`;

  const g3 = courseList.filter(c => c.grade === 'Grade 3');
  const g4 = courseList.filter(c => c.grade === 'Grade 4');

  return `${indexHead('Courses')}
${NAV('styles.css', 'index.html', 'topics.html')}

<main class="wrap">
  <section class="topic-hero">
    <div>
      <span class="eyebrow"><span class="eyebrow-dot"></span> Courses &middot; 15 questions each</span>
      <h1>Pick a course. Practice or test.</h1>
    </div>
    <p>Every course is fifteen questions on one topic. Choose <strong>Practice</strong> mode for hints along the way, or <strong>Assessment</strong> mode for a scored run.</p>
  </section>

  <section class="course-list-grid">
    ${colHTML(g3, 'GRADE 3')}
    ${colHTML(g4, 'GRADE 4')}
  </section>
</main>

${FOOTER}
</body>
</html>`;
}

function topicsIndex() {
  const colHTML = (topics, label) => `
    <div class="grade-col">
      <div class="section-tag">${label}</div>
      <h2>${label === 'GRADE 3' ? 'Foundations' : 'Building on the basics'}</h2>
      <ul class="topic-list">
      ${topics.map((t, i) =>
        `<li><a href="topics/${t.slug}.html"><span class="num">${String(i+1).padStart(2, '0')}</span><span>${t.title}</span><span class="arrow">&rarr;</span></a></li>`
      ).join('\n      ')}
      </ul>
    </div>`;

  return `${indexHead('Topics')}
${NAV('styles.css', 'index.html', 'topics.html')}

<main class="wrap">
  <section class="topic-hero">
    <div>
      <span class="eyebrow"><span class="eyebrow-dot"></span> Math topics, grades 3 and 4</span>
      <h1>Every skill, one page each.</h1>
    </div>
    <p>Pick a topic to see what it covers, work through a few examples, and learn the common mistakes to watch for. Built for working through tonight&rsquo;s homework — and for the times when last week&rsquo;s lesson didn&rsquo;t quite stick.</p>
  </section>

  <section class="grade-grid">
    ${colHTML(grade3, 'GRADE 3')}
    ${colHTML(grade4, 'GRADE 4')}
  </section>
</main>

${FOOTER}
</body>
</html>`;
}

// ─── BUILD ─────────────────────────────────────────────────────────────────
fs.writeFileSync(path.join(__dirname, 'topics.html'), topicsIndex(), 'utf8');

const all = [...grade3.map(t => ({...t, grade: 'Grade 3'})), ...grade4.map(t => ({...t, grade: 'Grade 4'}))];
all.forEach((t, i) => {
  const prev = i > 0 ? all[i-1] : null;
  const next = i < all.length - 1 ? all[i+1] : null;
  const html = topicPage(t, t.grade, prev, next);
  fs.writeFileSync(path.join(OUT_DIR, `${t.slug}.html`), html, 'utf8');
});

// Courses
const COURSES_DIR = path.join(__dirname, 'courses');
if (!fs.existsSync(COURSES_DIR)) fs.mkdirSync(COURSES_DIR, { recursive: true });
const courseList = [];
all.forEach((t) => {
  const qs = buildQuestionsFor(t.slug);
  if (!qs.length) return;
  const html = coursePage(t, t.grade, qs);
  fs.writeFileSync(path.join(COURSES_DIR, `${t.slug}.html`), html, 'utf8');
  courseList.push({ slug: t.slug, title: t.title, grade: t.grade, count: qs.length });
});
fs.writeFileSync(path.join(__dirname, 'courses.html'), coursesIndex(courseList), 'utf8');

console.log(`Generated topics.html, courses.html, ${all.length} topic pages, and ${courseList.length} course pages.`);
