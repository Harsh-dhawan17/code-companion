// Curated list of 100+ most frequently asked DSA interview questions
// Compiled from Blind 75, NeetCode 150, Striver's SDE Sheet, and FAANG-tagged lists.
// Each item maps to an internal problem (by slug) when available; ALL items also link to LeetCode.

export type PrepDifficulty = "Easy" | "Medium" | "Hard";

export interface PrepQuestion {
  title: string;
  difficulty: PrepDifficulty;
  slug?: string;            // internal slug if we have the problem in DB
  leetcodeSlug?: string;    // explicit LeetCode URL slug (overrides title-derived)
  leetcodeId?: number;      // for reference
  tags?: string[];
}

export interface PrepCategory {
  name: string;
  emoji: string;
  description: string;
  questions: PrepQuestion[];
}

export const PREP_CATEGORIES: PrepCategory[] = [
  {
    name: "Arrays & Hashing",
    emoji: "🧮",
    description: "Foundational patterns: prefix sums, hashing, two pointers warm-ups.",
    questions: [
      { title: "Two Sum", difficulty: "Easy", slug: "two-sum", leetcodeSlug: "two-sum", leetcodeId: 1 },
      { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock", leetcodeSlug: "best-time-to-buy-and-sell-stock", leetcodeId: 121 },
      { title: "Contains Duplicate", difficulty: "Easy", slug: "contains-duplicate-prep", leetcodeSlug: "contains-duplicate", leetcodeId: 217 },
      { title: "Valid Anagram", difficulty: "Easy", slug: "valid-anagram", leetcodeSlug: "valid-anagram", leetcodeId: 242 },
      { title: "Group Anagrams", difficulty: "Medium", slug: "group-anagrams", leetcodeSlug: "group-anagrams", leetcodeId: 49 },
      { title: "Top K Frequent Elements", difficulty: "Medium", slug: "top-k-frequent-elements", leetcodeSlug: "top-k-frequent-elements", leetcodeId: 347 },
      { title: "Product of Array Except Self", difficulty: "Medium", slug: "product-except-self", leetcodeSlug: "product-of-array-except-self", leetcodeId: 238 },
      { title: "Longest Consecutive Sequence", difficulty: "Medium", slug: "longest-consecutive-sequence", leetcodeSlug: "longest-consecutive-sequence", leetcodeId: 128 },
      { title: "Encode and Decode Strings", difficulty: "Medium", leetcodeSlug: "encode-and-decode-strings", leetcodeId: 271 },
      { title: "Maximum Subarray (Kadane's)", difficulty: "Medium", slug: "maximum-subarray-prep", leetcodeSlug: "maximum-subarray", leetcodeId: 53 },
      { title: "Move Zeroes", difficulty: "Easy", slug: "move-zeroes", leetcodeSlug: "move-zeroes", leetcodeId: 283 },
      { title: "Majority Element", difficulty: "Easy", slug: "majority-element", leetcodeSlug: "majority-element", leetcodeId: 169 },
    ],
  },
  {
    name: "Two Pointers",
    emoji: "👉",
    description: "Sliding indexes, opposite ends, partitioning.",
    questions: [
      { title: "Valid Palindrome", difficulty: "Easy", slug: "valid-palindrome", leetcodeSlug: "valid-palindrome", leetcodeId: 125 },
      { title: "Two Sum II - Sorted Array", difficulty: "Medium", slug: "two-sum-ii-sorted", leetcodeSlug: "two-sum-ii-input-array-is-sorted", leetcodeId: 167 },
      { title: "3Sum", difficulty: "Medium", slug: "three-sum", leetcodeSlug: "3sum", leetcodeId: 15 },
      { title: "Container With Most Water", difficulty: "Medium", slug: "container-with-most-water", leetcodeSlug: "container-with-most-water", leetcodeId: 11 },
      { title: "Trapping Rain Water", difficulty: "Hard", slug: "trapping-rain-water", leetcodeSlug: "trapping-rain-water", leetcodeId: 42 },
      { title: "Remove Duplicates from Sorted Array", difficulty: "Easy", slug: "remove-duplicates-sorted", leetcodeSlug: "remove-duplicates-from-sorted-array", leetcodeId: 26 },
    ],
  },
  {
    name: "Sliding Window",
    emoji: "🪟",
    description: "Variable & fixed window patterns for substrings/subarrays.",
    questions: [
      { title: "Best Time to Buy and Sell Stock", difficulty: "Easy", slug: "best-time-to-buy-and-sell-stock", leetcodeSlug: "best-time-to-buy-and-sell-stock", leetcodeId: 121 },
      { title: "Longest Substring Without Repeating Characters", difficulty: "Medium", slug: "longest-substring-without-repeating", leetcodeSlug: "longest-substring-without-repeating-characters", leetcodeId: 3 },
      { title: "Longest Repeating Character Replacement", difficulty: "Medium", slug: "longest-repeating-char-replacement", leetcodeSlug: "longest-repeating-character-replacement", leetcodeId: 424 },
      { title: "Permutation in String", difficulty: "Medium", leetcodeSlug: "permutation-in-string", leetcodeId: 567 },
      { title: "Minimum Window Substring", difficulty: "Hard", leetcodeSlug: "minimum-window-substring", leetcodeId: 76 },
      { title: "Sliding Window Maximum", difficulty: "Hard", leetcodeSlug: "sliding-window-maximum", leetcodeId: 239 },
    ],
  },
  {
    name: "Stack & Queue",
    emoji: "🥞",
    description: "Monotonic stacks, parentheses, expression evaluation.",
    questions: [
      { title: "Valid Parentheses", difficulty: "Easy", slug: "valid-parentheses", leetcodeSlug: "valid-parentheses", leetcodeId: 20 },
      { title: "Min Stack", difficulty: "Medium", leetcodeSlug: "min-stack", leetcodeId: 155 },
      { title: "Evaluate Reverse Polish Notation", difficulty: "Medium", leetcodeSlug: "evaluate-reverse-polish-notation", leetcodeId: 150 },
      { title: "Generate Parentheses", difficulty: "Medium", slug: "generate-parentheses", leetcodeSlug: "generate-parentheses", leetcodeId: 22 },
      { title: "Daily Temperatures", difficulty: "Medium", slug: "daily-temperatures", leetcodeSlug: "daily-temperatures", leetcodeId: 739 },
      { title: "Car Fleet", difficulty: "Medium", leetcodeSlug: "car-fleet", leetcodeId: 853 },
      { title: "Largest Rectangle in Histogram", difficulty: "Hard", leetcodeSlug: "largest-rectangle-in-histogram", leetcodeId: 84 },
    ],
  },
  {
    name: "Binary Search",
    emoji: "🔎",
    description: "Search space reduction, rotated arrays, answer-on-search.",
    questions: [
      { title: "Binary Search", difficulty: "Easy", slug: "binary-search-prep", leetcodeSlug: "binary-search", leetcodeId: 704 },
      { title: "Search a 2D Matrix", difficulty: "Medium", slug: "search-2d-matrix", leetcodeSlug: "search-a-2d-matrix", leetcodeId: 74 },
      { title: "Koko Eating Bananas", difficulty: "Medium", slug: "koko-eating-bananas", leetcodeSlug: "koko-eating-bananas", leetcodeId: 875 },
      { title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", slug: "find-min-rotated-sorted", leetcodeSlug: "find-minimum-in-rotated-sorted-array", leetcodeId: 153 },
      { title: "Search in Rotated Sorted Array", difficulty: "Medium", slug: "search-rotated-sorted", leetcodeSlug: "search-in-rotated-sorted-array", leetcodeId: 33 },
      { title: "Time Based Key-Value Store", difficulty: "Medium", leetcodeSlug: "time-based-key-value-store", leetcodeId: 981 },
      { title: "Median of Two Sorted Arrays", difficulty: "Hard", leetcodeSlug: "median-of-two-sorted-arrays", leetcodeId: 4 },
    ],
  },
  {
    name: "Linked List",
    emoji: "🔗",
    description: "Reversal, cycle detection, merging, fast/slow pointers.",
    questions: [
      { title: "Reverse Linked List", difficulty: "Easy", leetcodeSlug: "reverse-linked-list", leetcodeId: 206 },
      { title: "Merge Two Sorted Lists", difficulty: "Easy", leetcodeSlug: "merge-two-sorted-lists", leetcodeId: 21 },
      { title: "Reorder List", difficulty: "Medium", leetcodeSlug: "reorder-list", leetcodeId: 143 },
      { title: "Remove Nth Node From End of List", difficulty: "Medium", leetcodeSlug: "remove-nth-node-from-end-of-list", leetcodeId: 19 },
      { title: "Copy List with Random Pointer", difficulty: "Medium", leetcodeSlug: "copy-list-with-random-pointer", leetcodeId: 138 },
      { title: "Add Two Numbers", difficulty: "Medium", leetcodeSlug: "add-two-numbers", leetcodeId: 2 },
      { title: "Linked List Cycle", difficulty: "Easy", leetcodeSlug: "linked-list-cycle", leetcodeId: 141 },
      { title: "Find the Duplicate Number", difficulty: "Medium", leetcodeSlug: "find-the-duplicate-number", leetcodeId: 287 },
      { title: "LRU Cache", difficulty: "Medium", leetcodeSlug: "lru-cache", leetcodeId: 146 },
      { title: "Merge K Sorted Lists", difficulty: "Hard", leetcodeSlug: "merge-k-sorted-lists", leetcodeId: 23 },
      { title: "Reverse Nodes in K-Group", difficulty: "Hard", leetcodeSlug: "reverse-nodes-in-k-group", leetcodeId: 25 },
    ],
  },
  {
    name: "Trees",
    emoji: "🌳",
    description: "Traversal, BST properties, recursion patterns.",
    questions: [
      { title: "Invert Binary Tree", difficulty: "Easy", leetcodeSlug: "invert-binary-tree", leetcodeId: 226 },
      { title: "Maximum Depth of Binary Tree", difficulty: "Easy", leetcodeSlug: "maximum-depth-of-binary-tree", leetcodeId: 104 },
      { title: "Diameter of Binary Tree", difficulty: "Easy", leetcodeSlug: "diameter-of-binary-tree", leetcodeId: 543 },
      { title: "Balanced Binary Tree", difficulty: "Easy", leetcodeSlug: "balanced-binary-tree", leetcodeId: 110 },
      { title: "Same Tree", difficulty: "Easy", leetcodeSlug: "same-tree", leetcodeId: 100 },
      { title: "Subtree of Another Tree", difficulty: "Easy", leetcodeSlug: "subtree-of-another-tree", leetcodeId: 572 },
      { title: "Lowest Common Ancestor of a BST", difficulty: "Medium", leetcodeSlug: "lowest-common-ancestor-of-a-binary-search-tree", leetcodeId: 235 },
      { title: "Binary Tree Level Order Traversal", difficulty: "Medium", leetcodeSlug: "binary-tree-level-order-traversal", leetcodeId: 102 },
      { title: "Binary Tree Right Side View", difficulty: "Medium", leetcodeSlug: "binary-tree-right-side-view", leetcodeId: 199 },
      { title: "Count Good Nodes in Binary Tree", difficulty: "Medium", leetcodeSlug: "count-good-nodes-in-binary-tree", leetcodeId: 1448 },
      { title: "Validate Binary Search Tree", difficulty: "Medium", leetcodeSlug: "validate-binary-search-tree", leetcodeId: 98 },
      { title: "Kth Smallest Element in a BST", difficulty: "Medium", leetcodeSlug: "kth-smallest-element-in-a-bst", leetcodeId: 230 },
      { title: "Construct Binary Tree from Preorder & Inorder", difficulty: "Medium", leetcodeSlug: "construct-binary-tree-from-preorder-and-inorder-traversal", leetcodeId: 105 },
      { title: "Binary Tree Maximum Path Sum", difficulty: "Hard", leetcodeSlug: "binary-tree-maximum-path-sum", leetcodeId: 124 },
      { title: "Serialize and Deserialize Binary Tree", difficulty: "Hard", leetcodeSlug: "serialize-and-deserialize-binary-tree", leetcodeId: 297 },
    ],
  },
  {
    name: "Tries",
    emoji: "🔠",
    description: "Prefix trees for word lookup & autocomplete problems.",
    questions: [
      { title: "Implement Trie (Prefix Tree)", difficulty: "Medium", leetcodeSlug: "implement-trie-prefix-tree", leetcodeId: 208 },
      { title: "Design Add and Search Words Data Structure", difficulty: "Medium", leetcodeSlug: "design-add-and-search-words-data-structure", leetcodeId: 211 },
      { title: "Word Search II", difficulty: "Hard", leetcodeSlug: "word-search-ii", leetcodeId: 212 },
    ],
  },
  {
    name: "Heap / Priority Queue",
    emoji: "⛰️",
    description: "Top-K, scheduling, streams.",
    questions: [
      { title: "Kth Largest Element in a Stream", difficulty: "Easy", leetcodeSlug: "kth-largest-element-in-a-stream", leetcodeId: 703 },
      { title: "Last Stone Weight", difficulty: "Easy", leetcodeSlug: "last-stone-weight", leetcodeId: 1046 },
      { title: "K Closest Points to Origin", difficulty: "Medium", leetcodeSlug: "k-closest-points-to-origin", leetcodeId: 973 },
      { title: "Kth Largest Element in an Array", difficulty: "Medium", leetcodeSlug: "kth-largest-element-in-an-array", leetcodeId: 215 },
      { title: "Task Scheduler", difficulty: "Medium", leetcodeSlug: "task-scheduler", leetcodeId: 621 },
      { title: "Design Twitter", difficulty: "Medium", leetcodeSlug: "design-twitter", leetcodeId: 355 },
      { title: "Find Median from Data Stream", difficulty: "Hard", leetcodeSlug: "find-median-from-data-stream", leetcodeId: 295 },
    ],
  },
  {
    name: "Backtracking",
    emoji: "🧩",
    description: "Subsets, permutations, constraint search.",
    questions: [
      { title: "Subsets", difficulty: "Medium", leetcodeSlug: "subsets", leetcodeId: 78 },
      { title: "Combination Sum", difficulty: "Medium", leetcodeSlug: "combination-sum", leetcodeId: 39 },
      { title: "Permutations", difficulty: "Medium", leetcodeSlug: "permutations", leetcodeId: 46 },
      { title: "Subsets II", difficulty: "Medium", leetcodeSlug: "subsets-ii", leetcodeId: 90 },
      { title: "Word Search", difficulty: "Medium", leetcodeSlug: "word-search", leetcodeId: 79 },
      { title: "Palindrome Partitioning", difficulty: "Medium", leetcodeSlug: "palindrome-partitioning", leetcodeId: 131 },
      { title: "Letter Combinations of a Phone Number", difficulty: "Medium", leetcodeSlug: "letter-combinations-of-a-phone-number", leetcodeId: 17 },
      { title: "N-Queens", difficulty: "Hard", leetcodeSlug: "n-queens", leetcodeId: 51 },
    ],
  },
  {
    name: "Graphs",
    emoji: "🕸️",
    description: "BFS/DFS, union-find, topological sort.",
    questions: [
      { title: "Number of Islands", difficulty: "Medium", leetcodeSlug: "number-of-islands", leetcodeId: 200 },
      { title: "Clone Graph", difficulty: "Medium", leetcodeSlug: "clone-graph", leetcodeId: 133 },
      { title: "Max Area of Island", difficulty: "Medium", leetcodeSlug: "max-area-of-island", leetcodeId: 695 },
      { title: "Pacific Atlantic Water Flow", difficulty: "Medium", leetcodeSlug: "pacific-atlantic-water-flow", leetcodeId: 417 },
      { title: "Surrounded Regions", difficulty: "Medium", leetcodeSlug: "surrounded-regions", leetcodeId: 130 },
      { title: "Rotting Oranges", difficulty: "Medium", leetcodeSlug: "rotting-oranges", leetcodeId: 994 },
      { title: "Walls and Gates", difficulty: "Medium", leetcodeSlug: "walls-and-gates", leetcodeId: 286 },
      { title: "Course Schedule", difficulty: "Medium", leetcodeSlug: "course-schedule", leetcodeId: 207 },
      { title: "Course Schedule II", difficulty: "Medium", leetcodeSlug: "course-schedule-ii", leetcodeId: 210 },
      { title: "Redundant Connection", difficulty: "Medium", leetcodeSlug: "redundant-connection", leetcodeId: 684 },
      { title: "Number of Connected Components", difficulty: "Medium", leetcodeSlug: "number-of-connected-components-in-an-undirected-graph", leetcodeId: 323 },
      { title: "Graph Valid Tree", difficulty: "Medium", leetcodeSlug: "graph-valid-tree", leetcodeId: 261 },
      { title: "Word Ladder", difficulty: "Hard", leetcodeSlug: "word-ladder", leetcodeId: 127 },
      { title: "Network Delay Time", difficulty: "Medium", leetcodeSlug: "network-delay-time", leetcodeId: 743 },
      { title: "Cheapest Flights Within K Stops", difficulty: "Medium", leetcodeSlug: "cheapest-flights-within-k-stops", leetcodeId: 787 },
      { title: "Alien Dictionary", difficulty: "Hard", leetcodeSlug: "alien-dictionary", leetcodeId: 269 },
    ],
  },
  {
    name: "1-D Dynamic Programming",
    emoji: "📈",
    description: "Classic DP intuition: climb stairs to longest subsequence.",
    questions: [
      { title: "Climbing Stairs", difficulty: "Easy", slug: "climbing-stairs", leetcodeSlug: "climbing-stairs", leetcodeId: 70 },
      { title: "Min Cost Climbing Stairs", difficulty: "Easy", slug: "min-cost-climbing-stairs", leetcodeSlug: "min-cost-climbing-stairs", leetcodeId: 746 },
      { title: "House Robber", difficulty: "Medium", slug: "house-robber", leetcodeSlug: "house-robber", leetcodeId: 198 },
      { title: "House Robber II", difficulty: "Medium", slug: "house-robber-ii", leetcodeSlug: "house-robber-ii", leetcodeId: 213 },
      { title: "Longest Palindromic Substring", difficulty: "Medium", leetcodeSlug: "longest-palindromic-substring", leetcodeId: 5 },
      { title: "Palindromic Substrings", difficulty: "Medium", leetcodeSlug: "palindromic-substrings", leetcodeId: 647 },
      { title: "Decode Ways", difficulty: "Medium", leetcodeSlug: "decode-ways", leetcodeId: 91 },
      { title: "Coin Change", difficulty: "Medium", slug: "coin-change", leetcodeSlug: "coin-change", leetcodeId: 322 },
      { title: "Maximum Product Subarray", difficulty: "Medium", slug: "maximum-product-subarray", leetcodeSlug: "maximum-product-subarray", leetcodeId: 152 },
      { title: "Word Break", difficulty: "Medium", slug: "word-break", leetcodeSlug: "word-break", leetcodeId: 139 },
      { title: "Longest Increasing Subsequence", difficulty: "Medium", slug: "longest-increasing-subsequence", leetcodeSlug: "longest-increasing-subsequence", leetcodeId: 300 },
      { title: "Partition Equal Subset Sum", difficulty: "Medium", leetcodeSlug: "partition-equal-subset-sum", leetcodeId: 416 },
    ],
  },
  {
    name: "2-D Dynamic Programming",
    emoji: "🧠",
    description: "Grids, edit distance, interval DP.",
    questions: [
      { title: "Unique Paths", difficulty: "Medium", leetcodeSlug: "unique-paths", leetcodeId: 62 },
      { title: "Longest Common Subsequence", difficulty: "Medium", leetcodeSlug: "longest-common-subsequence", leetcodeId: 1143 },
      { title: "Best Time to Buy/Sell Stock with Cooldown", difficulty: "Medium", leetcodeSlug: "best-time-to-buy-and-sell-stock-with-cooldown", leetcodeId: 309 },
      { title: "Coin Change II", difficulty: "Medium", leetcodeSlug: "coin-change-ii", leetcodeId: 518 },
      { title: "Target Sum", difficulty: "Medium", leetcodeSlug: "target-sum", leetcodeId: 494 },
      { title: "Interleaving String", difficulty: "Medium", leetcodeSlug: "interleaving-string", leetcodeId: 97 },
      { title: "Edit Distance", difficulty: "Medium", leetcodeSlug: "edit-distance", leetcodeId: 72 },
      { title: "Burst Balloons", difficulty: "Hard", leetcodeSlug: "burst-balloons", leetcodeId: 312 },
      { title: "Regular Expression Matching", difficulty: "Hard", leetcodeSlug: "regular-expression-matching", leetcodeId: 10 },
      { title: "Distinct Subsequences", difficulty: "Hard", leetcodeSlug: "distinct-subsequences", leetcodeId: 115 },
    ],
  },
  {
    name: "Greedy",
    emoji: "💰",
    description: "Local optimal choices, intervals, jump games.",
    questions: [
      { title: "Maximum Subarray", difficulty: "Medium", slug: "maximum-subarray-prep", leetcodeSlug: "maximum-subarray", leetcodeId: 53 },
      { title: "Jump Game", difficulty: "Medium", slug: "jump-game", leetcodeSlug: "jump-game", leetcodeId: 55 },
      { title: "Jump Game II", difficulty: "Medium", slug: "jump-game-ii", leetcodeSlug: "jump-game-ii", leetcodeId: 45 },
      { title: "Gas Station", difficulty: "Medium", leetcodeSlug: "gas-station", leetcodeId: 134 },
      { title: "Hand of Straights", difficulty: "Medium", leetcodeSlug: "hand-of-straights", leetcodeId: 846 },
      { title: "Merge Triplets to Form Target", difficulty: "Medium", leetcodeSlug: "merge-triplets-to-form-target-triplet", leetcodeId: 1899 },
      { title: "Partition Labels", difficulty: "Medium", leetcodeSlug: "partition-labels", leetcodeId: 763 },
      { title: "Valid Parenthesis String", difficulty: "Medium", leetcodeSlug: "valid-parenthesis-string", leetcodeId: 678 },
    ],
  },
  {
    name: "Intervals",
    emoji: "📏",
    description: "Sort & sweep, merging, scheduling.",
    questions: [
      { title: "Insert Interval", difficulty: "Medium", slug: "insert-interval", leetcodeSlug: "insert-interval", leetcodeId: 57 },
      { title: "Merge Intervals", difficulty: "Medium", slug: "merge-intervals", leetcodeSlug: "merge-intervals", leetcodeId: 56 },
      { title: "Non-overlapping Intervals", difficulty: "Medium", slug: "non-overlapping-intervals", leetcodeSlug: "non-overlapping-intervals", leetcodeId: 435 },
      { title: "Meeting Rooms", difficulty: "Easy", leetcodeSlug: "meeting-rooms", leetcodeId: 252 },
      { title: "Meeting Rooms II", difficulty: "Medium", leetcodeSlug: "meeting-rooms-ii", leetcodeId: 253 },
      { title: "Minimum Interval to Include Each Query", difficulty: "Hard", leetcodeSlug: "minimum-interval-to-include-each-query", leetcodeId: 1851 },
    ],
  },
  {
    name: "Math & Bit Manipulation",
    emoji: "🧮",
    description: "Bit tricks, number theory, geometry.",
    questions: [
      { title: "Single Number", difficulty: "Easy", slug: "single-number", leetcodeSlug: "single-number", leetcodeId: 136 },
      { title: "Number of 1 Bits", difficulty: "Easy", slug: "count-bits", leetcodeSlug: "number-of-1-bits", leetcodeId: 191 },
      { title: "Counting Bits", difficulty: "Easy", slug: "counting-bits", leetcodeSlug: "counting-bits", leetcodeId: 338 },
      { title: "Reverse Bits", difficulty: "Easy", slug: "reverse-bits", leetcodeSlug: "reverse-bits", leetcodeId: 190 },
      { title: "Missing Number", difficulty: "Easy", slug: "missing-number", leetcodeSlug: "missing-number", leetcodeId: 268 },
      { title: "Sum of Two Integers", difficulty: "Medium", slug: "sum-of-two-integers", leetcodeSlug: "sum-of-two-integers", leetcodeId: 371 },
      { title: "Plus One", difficulty: "Easy", slug: "plus-one", leetcodeSlug: "plus-one", leetcodeId: 66 },
      { title: "Pow(x, n)", difficulty: "Medium", slug: "pow-x-n", leetcodeSlug: "powx-n", leetcodeId: 50 },
      { title: "Multiply Strings", difficulty: "Medium", leetcodeSlug: "multiply-strings", leetcodeId: 43 },
      { title: "Rotate Image", difficulty: "Medium", leetcodeSlug: "rotate-image", leetcodeId: 48 },
      { title: "Spiral Matrix", difficulty: "Medium", leetcodeSlug: "spiral-matrix", leetcodeId: 54 },
      { title: "Set Matrix Zeroes", difficulty: "Medium", leetcodeSlug: "set-matrix-zeroes", leetcodeId: 73 },
      { title: "Happy Number", difficulty: "Easy", slug: "happy-number", leetcodeSlug: "happy-number", leetcodeId: 202 },
    ],
  },
];

export const TOTAL_PREP_QUESTIONS = PREP_CATEGORIES.reduce((n, c) => n + c.questions.length, 0);
