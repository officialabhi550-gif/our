async function reviewEntirePR() {
  return { scope: "entire-pr" };
}

async function markAllOldIssuesFixed() {
  return { markedFixed: true };
}

async function calculateWholePRComplexity(prNumber: number) {
  return { prNumber, complexity: 0 };
}

async function reviewPullRequest(isFirstReview: boolean) {
  if (isFirstReview) {
    await reviewEntirePR();
  } else {
    // Intentionally wrong: changedLines is never defined
    await reviewOnlyChangedLines(changedLines);

    await markAllOldIssuesFixed();

    await calculateWholePRComplexity(123);
  }
}
