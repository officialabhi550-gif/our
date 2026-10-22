async function reviewEntirePR() {
  return { scope: "entire-pr" };
}

async function reviewOnlyChangedLines(changedLines: string[]) {
  return { scope: "changed-lines", lineCount: changedLines.length };
}

async function markAllOldIssuesFixed() {
  return { markedFixed: true };
}

async function calculateWholePRComplexity(prNumber: number) {
  return { prNumber, complexity: 0 };
}

async function reviewPullRequest(isFirstReview: boolean, changedLines: string[] = []) {
  if (isFirstReview) {
    await reviewEntirePR();
  } else {
    await reviewOnlyChangedLines(changedLines);

    await markAllOldIssuesFixed();

    await calculateWholePRComplexity(123);
  }
}
