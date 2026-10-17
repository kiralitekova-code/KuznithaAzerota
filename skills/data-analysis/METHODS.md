# Analysis Methods and When to Use Them

Quick reference for choosing the right analysis technique based on the question.

## Method Selection Guide

| User Question | Method | What It Shows | Output |
|---------------|--------|---------------|--------|
| "What does my data look like?" | Descriptive statistics | Center, spread, shape of each column | Summary table + plain-language overview |
| "What's typical? What's extreme?" | Distribution analysis | Where most values cluster, where outliers live | Ranges, quartiles, flagged outliers |
| "Is X trending up or down?" | Time series + trend line | Direction, magnitude, seasonality | Direction + % change + seasonal pattern |
| "Why did X change?" | Decomposition / comparison | Which factors contributed most to the change | Ranked contributing factors |
| "Are these groups different?" | Comparative statistics | How groups differ and by how much | Key differences with effect sizes |
| "What's related to what?" | Correlation analysis | Which variables move together | Relationship strength + direction |
| "What's normal vs unusual?" | Anomaly detection | Values outside expected ranges | Threshold values + flagged data points |
| "What should I expect next?" | Simple extrapolation | Where the trend points | Forecast range + confidence + caveats |
| "What drives X?" | Regression (conceptual) | Which factors best predict the outcome | Ranked drivers with estimated impact |

## Analysis Patterns

### Descriptive Statistics

Always start here. Compute for each numeric column:
- **Mean** (average) — sensitive to outliers
- **Median** (middle value) — robust to outliers. Compare with mean: if very different, outliers are skewing
- **Min / Max** — the full range
- **25th / 75th percentile** — where the middle 50% falls

Present as:
```
Revenue: median $4,200, ranging from $800 to $12,000.
Middle 50% of months fall between $3,100 and $5,800.
The average ($4,800) is higher than the median, meaning a few high months pull it up.
```

### Trend Analysis

For time-series data:
1. Plot direction: is it going up, down, or flat? (Calculate % change from first to last period)
2. Check for seasonality: does the pattern repeat at regular intervals?
3. Identify inflection points: where did the trend change direction?
4. Separate signal from noise: is the change meaningful or just normal fluctuation?

```
Revenue is trending up 12% over the period (Jan: $3,800 → Dec: $4,300).
Pattern: dips ~15% every Q1, then recovers.
Inflection point: July saw a sudden 20% jump, coinciding with [event].
```

### Comparative Analysis

When comparing groups:
1. Start with the headline difference
2. Show the absolute numbers (not just percentages)
3. Check if the difference is meaningful (effect size) or just statistical noise
4. Consider confounding variables

```
Group A converts at 8.2% vs Group B at 6.1%.
That's a 2.1 percentage point difference, or ~34% relative improvement.
At current traffic (5,000 visitors/month), that's ~105 more conversions from Group A.
However, Group A also had higher-budget ads, so the difference may be budget, not creative.
```

### Anomaly Detection

For finding what's unusual:
1. Define "normal": use median and interquartile range (IQR)
2. Flag outliers: values beyond 1.5 × IQR from the quartiles
3. For each outlier, check: is this an error or a real signal?

```
March revenue ($12,000) is an outlier — 3x higher than the median ($4,200).
Checking: this was a real event (large one-time contract), not a data error.
Insight: excluding this outlier, the underlying trend is actually flat.
```

## Visualization Recommendations

After each finding, suggest the best way to show it visually:

| Finding Type | Best Chart | When |
|-------------|-----------|------|
| Trend over time | Line chart | Always for time series |
| Group comparison | Bar chart | Comparing categories |
| Part of whole | Treemap | <6 categories. Avoid pie charts |
| Distribution | Histogram or box plot | Showing spread |
| Relationship | Scatter plot | Two numeric variables |
| Anomaly | Chart with highlighted points | Calling attention to outliers |
| Ranking | Horizontal bar chart | Ordering by magnitude |

Provide the data in a format ready for copy-paste into a spreadsheet or charting tool.
