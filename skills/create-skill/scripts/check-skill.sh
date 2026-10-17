#!/usr/bin/env bash
# check-skill.sh — lint a drafted AgentHere skill before publishing.
# Catches the common breakage: bad slug, missing/over-long trigger description,
# bloated body, nested references, too many resources.
#
# Usage:  check-skill.sh <path/to/SKILL.md | path/to/skill-dir>
# Exit:   0 = clean (warnings ok) · 1 = errors found · 2 = usage/missing
set -uo pipefail

target="${1:-}"
if [[ -z "$target" ]]; then
  echo "usage: check-skill.sh <SKILL.md | skill-dir>" >&2; exit 2
fi
if [[ -d "$target" ]]; then skill_md="$target/SKILL.md";  skill_dir="$target"
else                            skill_md="$target";         skill_dir="$(dirname "$target")"; fi
[[ -f "$skill_md" ]] || { echo "ERROR: SKILL.md not found at $skill_md" >&2; exit 1; }

errors=0; warns=0
err(){  echo "ERROR: $*" >&2; errors=$((errors+1)); }
warn(){ echo "WARN:  $*";     warns=$((warns+1)); }
ok(){   echo "ok:    $*"; }

# --- frontmatter + name ---
if [[ "$(head -n1 "$skill_md")" != "---" ]]; then
  err "missing YAML frontmatter (first line must be ---)."
fi
name="$(awk -F': ' '/^name:/{print $2; exit}' "$skill_md")"
if [[ -z "$name" ]]; then
  err "frontmatter missing 'name'."
elif [[ ! "$name" =~ ^[a-z0-9][a-z0-9-]*[a-z0-9]$ ]]; then
  err "name '$name' is not a valid slug (need ^[a-z0-9][a-z0-9-]*[a-z0-9]\$)."
else
  ok "name slug: $name"
fi

# --- description (best-effort; handles inline or folded >- block scalars) ---
desc="$(awk '
  /^description:/ { f=1; sub(/^description:[[:space:]]*/,""); v=$0;
                    if (v==">-"||v=="|"||v=="") b=1; else {print v; exit} ; next }
  f && b { if ($0 ~ /^[[:space:]]/ && $0 !~ /^---/) { gsub(/^[[:space:]]+/,""); print }
           else exit }
' "$skill_md" | tr "\n" " " | sed 's/  */ /g' | sed 's/^ //;s/ $//')"
if [[ -z "$desc" ]]; then
  err "frontmatter missing 'description' (this is the trigger — the most important field)."
else
  dlen="${#desc}"
  if   (( dlen > 500 )); then warn "description is $dlen chars — the app caps at 500 and truncates."
  elif (( dlen < 40 ));  then warn "description is very short ($dlen chars) — likely under-triggers."
  else ok "description length: $dlen chars"
  fi
  grep -qiE '(do not|don.t use)' <<<"$desc" || warn "description has no negative scope ('Do NOT use for …') — add one to prevent misfires."
fi

# --- body line count (after the closing ---) ---
closing="$(awk 'NR>1 && $0=="---"{print NR; exit}' "$skill_md")"
if [[ -n "$closing" ]]; then
  total="$(wc -l < "$skill_md")"
  body_lines=$(( total - closing ))
  if   (( body_lines > 500 )); then warn "body is $body_lines lines (aim < 500) — move depth into references/."
  elif (( body_lines < 5 ));   then warn "body is very short ($body_lines lines)."
  else ok "body lines: $body_lines"
  fi
fi

# --- references must stay one level deep ---
nested="$(find "$skill_dir" -type f \( -path '*/references/*/*' -o -path '*/reference/*/*' \) 2>/dev/null | head -1)"
[[ -n "$nested" ]] && warn "nested reference file found ($nested) — keep references/ one level deep."

# --- resource count (max 50) ---
res_count="$(find "$skill_dir" -type f ! -name SKILL.md 2>/dev/null | wc -l | tr -d ' ')"
if   (( res_count > 50 )); then err "resources exceed the 50-file limit ($res_count)."
else ok "resource files: $res_count"; fi

echo ""
if (( errors > 0 )); then
  echo "RESULT: $errors error(s), $warns warning(s) — fix the errors before publishing."
  exit 1
fi
echo "RESULT: $errors error(s), $warns warning(s) — looks good to publish."
