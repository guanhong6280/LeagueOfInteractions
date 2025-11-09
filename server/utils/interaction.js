function normalizeAbility(ability) {
  // Expect P/Q/W/E/R already; keep as-is to match client mapping
  return String(ability).toUpperCase();
}

function buildInteractionKey({ champion1, ability1, champion2, ability2 }) {
  const a = String(champion1 || '').toLowerCase();
  const b = String(champion2 || '').toLowerCase();
  const ab1 = normalizeAbility(ability1 || '');
  const ab2 = normalizeAbility(ability2 || '');
  if (a <= b) {
    return `${a}#${ab1}#${b}#${ab2}`;
  }
  return `${b}#${ab2}#${a}#${ab1}`;
}

module.exports = { buildInteractionKey };


