// Topic-wise learning roadmaps. Each stage contains a curated ordered list of internal problem slugs.
export interface RoadmapStage {
  name: string;
  description: string;
  slugs: string[];
}
export interface Roadmap {
  id: string;
  title: string;
  emoji: string;
  description: string;
  stages: RoadmapStage[];
}

export const ROADMAPS: Roadmap[] = [
  {
    id: "fundamentals",
    title: "Programming Fundamentals",
    emoji: "🌱",
    description: "Start here if you're new to coding interviews. Master loops, conditionals, and basic math.",
    stages: [
      { name: "Hello World", description: "First steps with I/O and printing.", slugs: ["hello-world", "fizz-buzz", "even-or-odd-v1", "absolute-value-v1"] },
      { name: "Math Warm-ups", description: "Basic arithmetic and number sense.", slugs: ["sum-1-n-v1", "factorial", "fibonacci-number", "gcd", "lcm", "is-prime"] },
      { name: "Digit Manipulation", description: "Reverse, count, sum digits.", slugs: ["reverse-integer", "palindrome-number", "sum-of-digits", "digit-count-v1", "armstrong"] },
    ],
  },
  {
    id: "arrays-hashing",
    title: "Arrays & Hashing",
    emoji: "🧮",
    description: "The most common interview category. Every FAANG screen has at least one of these.",
    stages: [
      { name: "Foundations", description: "Linear scans, indexing, basic operations.", slugs: ["array-sum", "max-of-array", "second-largest", "linear-search"] },
      { name: "Hashing Patterns", description: "Use hash maps to drop O(n²) to O(n).", slugs: ["two-sum", "contains-duplicate", "valid-anagram", "majority-element"] },
      { name: "Classic Problems", description: "Must-know on every interview list.", slugs: ["maximum-subarray-prep", "best-time-to-buy-and-sell-stock", "move-zeroes", "rotate-array", "merge-sorted-arrays", "plus-one"] },
    ],
  },
  {
    id: "strings",
    title: "Strings",
    emoji: "🔤",
    description: "Anagrams, palindromes, parsing — bread and butter of interviews.",
    stages: [
      { name: "Basics", description: "Reversal, counting, simple checks.", slugs: ["reverse-string", "count-vowels", "count-words"] },
      { name: "Palindromes & Anagrams", description: "Pattern matching with two pointers and hashing.", slugs: ["valid-palindrome", "valid-anagram"] },
    ],
  },
  {
    id: "binary-search",
    title: "Binary Search",
    emoji: "🎯",
    description: "Whenever the array is sorted (or you can think monotonically), binary search is the answer.",
    stages: [
      { name: "Classic", description: "Standard textbook binary search.", slugs: ["binary-search", "binary-search-prep"] },
    ],
  },
  {
    id: "stack-parens",
    title: "Stacks",
    emoji: "📚",
    description: "LIFO patterns: brackets, monotonic stacks, expression parsing.",
    stages: [
      { name: "Bracket Matching", description: "The #1 stack interview question.", slugs: ["valid-parentheses"] },
    ],
  },
  {
    id: "dp-1d",
    title: "1-D Dynamic Programming",
    emoji: "🧩",
    description: "Recognize overlapping subproblems. Build a memo or a tabulation.",
    stages: [
      { name: "Stairs Family", description: "The gateway DP problem.", slugs: ["climbing-stairs", "fibonacci-number"] },
      { name: "Subarrays", description: "Kadane's algorithm and friends.", slugs: ["maximum-subarray-prep", "maximum-subarray"] },
    ],
  },
  {
    id: "bits-math",
    title: "Bit Manipulation & Math",
    emoji: "⚡",
    description: "XOR tricks, parity, prime sieves — bonus tools every interviewer loves.",
    stages: [
      { name: "Bits", description: "XOR, popcount, power-of-two checks.", slugs: ["single-number", "count-bits", "missing-number", "power-of-two"] },
      { name: "Math", description: "Primes and number theory basics.", slugs: ["count-primes", "is-prime", "gcd"] },
    ],
  },
];
