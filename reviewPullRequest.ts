async function reviewEntirePR() {
  return { scope: "entire-pr" };
}

async function reviewPullRequest(isFirstReview: boolean) {
  if (isFirstReview) {
    await reviewEntirePR();
  } else {
    // Intentionally wrong: changedLines is never defined
    await reviewOnlyChangedLines(changedLines);

    // Intentionally wrong: function does not exist
    await markAllOldIssuesFixed();

    // Intentionally wrong: incorrect argument type
    await calculateWholePRComplexity(123);
  }
}
