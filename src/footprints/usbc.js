// Ergogen v4.2.1 / KiCad 8+
// USB-C 12-contact USB 2.0 receptacle
// Compatible with HRO TYPE-C-31-M-12.

module.exports = {
  params: {
    designator: 'J',
    side: 'F',
    reversible: false, // Set to true in your YAML to make this a reversible footprint

    GND:  { type: 'net', value: 'GND' },
    VBUS: { type: 'net', value: 'VBUS' },
    DP:   { type: 'net', value: 'DP' },
    DM:   { type: 'net', value: 'DM' },
  },

  body: p => {
    const netPart = net => (net && net.str ? ` ${net.str}` : '');
    const rotation = p.r || 0;

    const isReversible = p.reversible;
    // If reversible, generate both sides. Otherwise, generate only the side requested.
    const activeSides = isReversible ? ['F', 'B'] : [p.side === 'B' ? 'B' : 'F'];
    
    // Only mirror the fundamental physical through-holes if it's strictly a bottom-side placement
    const flipPhysical = p.side === 'B' && !isReversible;
    const mx = value => (flipPhysical ? -value : value);

    let body = '';

    // The base footprint layer is typically 'F' unless explicitly placed single-sided on 'B'
    const baseLayer = p.side === 'B' ? 'B' : 'F';

    body += `(footprint "USB_C_Receptacle_HRO_TYPE-C-31-M-12${isReversible ? '_Reversible' : ''}"\n`;
    body += `  (layer "${baseLayer}.Cu")\n`;
    body += `  ${p.at}\n`;
    body += '  (attr smd)\n';
    body += '  (descr "HRO TYPE-C-31-M-12 USB-C USB 2.0 top-mount receptacle")\n';
    body += '  (tags "USB USB-C HRO TYPE-C-31-M-12 USB2")\n';

    // ---------------------------------------------------------
    // THROUGH HOLES (Generated only once)
    // ---------------------------------------------------------
    const shieldPad = (number, x, y, height) => `
  (pad "${number}" thru_hole oval
    (at ${mx(x)} ${y} ${rotation})
    (size 1 ${height})
    (drill oval 0.6 ${height - 0.4})
    (layers "*.Cu" "*.Mask")${netPart(p.GND)})
`;

    const alignmentHole = x => `
  (pad "" np_thru_hole circle
    (at ${mx(x)} -2.60 ${rotation})
    (size 0.65 0.65)
    (drill 0.65)
    (layers "*.Cu" "*.Mask"))
`;

    // Shell / retention tabs
    body += shieldPad('S1', -4.32,  1.05, 1.60);
    body += shieldPad('S1',  4.32,  1.05, 1.60);
    body += shieldPad('S1', -4.32, -3.13, 2.10);
    body += shieldPad('S1',  4.32, -3.13, 2.10);

    // Mechanical alignment holes
    body += alignmentHole(-2.89);
    body += alignmentHole(2.89);

    // ---------------------------------------------------------
    // SURFACE MOUNT & SILKSCREEN (Generated per active side)
    // ---------------------------------------------------------
    activeSides.forEach(layer => {
      const isBack = layer === 'B';
      const justify = isBack ? ' (justify mirror)' : '';

      // For a reversible footprint on the back side, we mirror the X coordinate.
      // This correctly flips the physical layout so D+/D- cross over perfectly.
      const layerMx = value => {
        if (isReversible && isBack) return -value;
        return mx(value);
      };

      const smdPad = (number, x, width, net) => {
        // Prefix with F or B if reversible so KiCad DRC doesn't flag overlapping pad numbers
        const padName = isReversible ? `${layer}${number}` : number;
        return `
  (pad "${padName}" smd rect
    (at ${layerMx(x)} -4.045 ${rotation})
    (size ${width} 1.45)
    (layers "${layer}.Cu" "${layer}.Paste" "${layer}.Mask")${netPart(net)})
`;
      };

      body += `
  (fp_text reference "${p.ref}"
    (at 0 -5.645 ${rotation})
    (layer "${layer}.SilkS")
    ${p.ref_hide}
    (effects (font (size 1 1) (thickness 0.15))${justify}))
`;

      body += `
  (fp_text value "USB_C_12P"
    (at 0 5.10 ${rotation})
    (layer "${layer}.Fab")
    (effects (font (size 1 1) (thickness 0.15))${justify}))
`;

      // Fabrication body outline
      body += `
  (fp_rect
    (start ${layerMx(-4.47)} -3.65)
    (end ${layerMx(4.47)} 3.65)
    (stroke (width 0.10) (type solid))
    (fill none)
    (layer "${layer}.Fab"))
`;

      // Courtyard
      body += `
  (fp_rect
    (start ${layerMx(-5.32)} -5.27)
    (end ${layerMx(5.32)} 4.15)
    (stroke (width 0.05) (type solid))
    (fill none)
    (layer "${layer}.CrtYd"))
`;

      // Silkscreen
      body += `
  (fp_line
    (start ${layerMx(-4.70)} -1.90)
    (end ${layerMx(-4.70)} 0.10)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${layerMx(-4.70)} 2.00)
    (end ${layerMx(-4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${layerMx(4.70)} -1.90)
    (end ${layerMx(4.70)} 0.10)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${layerMx(4.70)} 2.00)
    (end ${layerMx(4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${layerMx(-4.70)} 3.90)
    (end ${layerMx(4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
`;

      // USB-C contact row (0.5 mm pitch)
      body += smdPad(1,  -3.25, 0.60, p.GND);
      body += smdPad(2,  -2.45, 0.60, p.VBUS);
      body += smdPad(3,  -1.75, 0.30, null); // SBU2
      body += smdPad(4,  -1.25, 0.30, null); // CC1
      body += smdPad(5,  -0.75, 0.30, p.DM);
      body += smdPad(6,  -0.25, 0.30, p.DM);
      body += smdPad(7,   0.25, 0.30, p.DP);
      body += smdPad(8,   0.75, 0.30, p.DP);
      body += smdPad(9,   1.25, 0.30, null); // SBU1
      body += smdPad(10,  1.75, 0.30, null); // CC2
      body += smdPad(11,  2.45, 0.60, p.VBUS);
      body += smdPad(12,  3.25, 0.60, p.GND);
    });

    body += ')';
    return body;
  }
};