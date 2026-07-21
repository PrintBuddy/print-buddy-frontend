// Content for the first-time onboarding tutorial (TutorialGuide.jsx).
// Kept separate from the component so copy can be edited without touching
// rendering logic. `body` is either a string (one paragraph) or an array
// of strings (rendered as a bullet list).
const tutorialSteps = [
    {
        title: "Welcome to Print Buddy 👋",
        body: "This quick guide walks you through the main things you can do here. It only takes a minute — use Next/Back to move through it, or close it any time and reopen it later from the ? icon in the top bar.",
    },
    {
        title: "Home",
        body: "Your dashboard: a quick look at your most recent print jobs and uploaded files, with links to see the full lists.",
    },
    {
        title: "Print",
        body: [
            "Upload one or more files you want to print.",
            "Pick which printer to send them to.",
            "Choose preferences like color, sides, and page range.",
            "Review the cost and submit — it's deducted from your balance.",
        ],
    },
    {
        title: "Files",
        body: "Manage the files you've uploaded: select one or more to print again, or delete the ones you no longer need.",
    },
    {
        title: "History",
        body: "See every print job you've submitted, its status and cost. If something went wrong with a job, you can request a refund for it from here.",
    },
    {
        title: "Balance",
        body: "Your current credit and recent transactions. Use \"Request Recharge\" to tell an admin how much you paid (cash or transfer) so they can add it to your balance.",
    },
    {
        title: "Extras",
        body: "Buy add-ons like spiral binding. Submit a purchase request and an admin will confirm it once it's ready.",
    },
    {
        title: "Statistics",
        body: "A breakdown of your printing activity — pages, cost, and usage by printer — filterable by time period.",
    },
    {
        title: "You're all set! ✅",
        body: "That's everything. You can reopen this guide any time using the ? icon in the top bar.",
    },
];

export default tutorialSteps;
