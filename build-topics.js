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

console.log(`Generated topics.html and ${all.length} topic pages.`);
