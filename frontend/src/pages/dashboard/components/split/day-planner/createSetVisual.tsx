interface SetType {
    id: number;
    name: string;
    icon: string;
  }
  
  interface SetPhase {
    phase_number: number;
    rep_range_min: number;
    rep_range_max: number;
    weight_modifier: number;
    target_rest_period_seconds: number;
  }
  
  /**
   * Creates a textual visual representation of a set.
   * The visual includes the set type’s icon for each phase, along with details like rep ranges,
   * weight modifiers, and rest periods. Phases are separated by arrows to indicate progression.
   *
   * @param setType - The overall set type (e.g., Pyramid, Drop Set, etc.)
   * @param phases - An array of phases that define the set’s progression.
   * @returns A string containing the visual representation.
   */
  function createSetVisual(setType: SetType, phases: SetPhase[]): string {
    // Start with the set type name and base icon
    let visual = `Set Type: ${setType.name}\n`;
    visual += `Base Icon: ${setType.icon}\n\n`;
  
    // For each phase, create a line that includes:
    // • A phase header
    // • A visual block (using the set type’s icon) that could be repeated or styled
    // • Key details for that phase
    phases.forEach((phase, index) => {
      // Example: repeat the icon a number of times relative to the weight modifier
      // (You could use a more sophisticated mapping here as needed.)
      const iconCount = Math.max(1, Math.round(phase.weight_modifier * 3));
      const phaseIcon = new Array(iconCount).fill(setType.icon).join(' ');
      visual += `Phase ${phase.phase_number}: ${phaseIcon}\n`;
      visual += `   Reps: ${phase.rep_range_min}-${phase.rep_range_max}, ` +
                `Weight Modifier: x${phase.weight_modifier}, ` +
                `Rest: ${phase.target_rest_period_seconds}s\n`;
      if (index < phases.length - 1) {
        visual += `   ↓\n`; // Arrow indicates progression to the next phase
      }
    });
  
    return visual;
  }
  
  // Example usage:
  const pyramidSetType: SetType = { id: 5, name: 'Pyramid Sets', icon: '▁▂▃▂▁' };
  const pyramidPhases: SetPhase[] = [
    { phase_number: 1, rep_range_min: 8, rep_range_max: 12, weight_modifier: 1, target_rest_period_seconds: 90 },
    { phase_number: 2, rep_range_min: 8, rep_range_max: 12, weight_modifier: 0.8, target_rest_period_seconds: 0 },
    { phase_number: 3, rep_range_min: 8, rep_range_max: 12, weight_modifier: 0.6, target_rest_period_seconds: 90 },
  ];
  
 );
  