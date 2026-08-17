// Ergogen v4.2.1 / KiCad 8+
// USB-C 12-contact USB 2.0 receptacle
// Compatible with HRO TYPE-C-31-M-12.
//
// The coordinate system and mechanical locations are based on the
// KiCad HRO TYPE-C-31-M-12 footprint.
//
// IMPORTANT: Do not set this connector up as a reversible footprint.
// USB-C plugs are reversible; the physical receptacle is installed on
// exactly one PCB side.

module.exports = {
  params: {
    designator: 'J',
    side: 'F',

    GND:  { type: 'net', value: 'GND' },
    VBUS: { type: 'net', value: 'VBUS' },
    DP:   { type: 'net', value: 'DP' },
    DM:   { type: 'net', value: 'DM' },
  },

  body: p => {
    const layer = p.side === 'B' ? 'B' : 'F';
    const mirror = p.side === 'B';

    // Ergogen generates a complete KiCad net expression in net.str,
    // such as: (net 1 "GND")
    const netPart = net => (net && net.str ? ` ${net.str}` : '');

    // p.r is the footprint placement angle supplied by Ergogen.
    // It MUST be included in pads so pad geometry rotates with the port.
    const rotation = p.r || 0;

    // Mirror X only for a bottom-side connector placement.
    const mx = value => (mirror ? -value : value);

    const smdPad = (number, x, width, net) => `
  (pad "${number}" smd rect
    (at ${mx(x)} -4.045 ${rotation})
    (size ${width} 1.45)
    (layers "${layer}.Cu" "${layer}.Paste" "${layer}.Mask")${netPart(net)})
`;

    // The pad rotation is particularly important for these:
    // without it, oval shield holes remain vertical after 90° rotation.
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

    let body = '';

    body += '(footprint "USB_C_Receptacle_HRO_TYPE-C-31-M-12"\n';
    body += `  (layer "${layer}.Cu")\n`;
    body += `  ${p.at}\n`;
    body += '  (attr smd)\n';
    body += '  (descr "HRO TYPE-C-31-M-12 USB-C USB 2.0 top-mount receptacle")\n';
    body += '  (tags "USB USB-C HRO TYPE-C-31-M-12 USB2")\n';

    body += `
  (fp_text reference "${p.ref}"
    (at 0 -5.645)
    (layer "${layer}.SilkS")
    ${p.ref_hide}
    (effects (font (size 1 1) (thickness 0.15))))
`;

    body += `
  (fp_text value "USB_C_12P"
    (at 0 5.10)
    (layer "${layer}.Fab")
    (effects (font (size 1 1) (thickness 0.15))))
`;

    // Fabrication body outline.
    body += `
  (fp_rect
    (start ${mx(-4.47)} -3.65)
    (end ${mx(4.47)} 3.65)
    (stroke (width 0.10) (type solid))
    (fill none)
    (layer "${layer}.Fab"))
`;

    // Courtyard.
    body += `
  (fp_rect
    (start ${mx(-5.32)} -5.27)
    (end ${mx(5.32)} 4.15)
    (stroke (width 0.05) (type solid))
    (fill none)
    (layer "${layer}.CrtYd"))
`;

    // Silkscreen, deliberately split around the upper shield holes.
    body += `
  (fp_line
    (start ${mx(-4.70)} -1.90)
    (end ${mx(-4.70)} 0.10)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${mx(-4.70)} 2.00)
    (end ${mx(-4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${mx(4.70)} -1.90)
    (end ${mx(4.70)} 0.10)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${mx(4.70)} 2.00)
    (end ${mx(4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
  (fp_line
    (start ${mx(-4.70)} 3.90)
    (end ${mx(4.70)} 3.90)
    (stroke (width 0.12) (type solid))
    (fill none)
    (layer "${layer}.SilkS"))
`;

    // Shell / retention tabs.
    // The official footprint uses the same shield pad number for all four tabs.
    body += shieldPad('S1', -4.32,  1.05, 1.60);
    body += shieldPad('S1',  4.32,  1.05, 1.60);
    body += shieldPad('S1', -4.32, -3.13, 2.10);
    body += shieldPad('S1',  4.32, -3.13, 2.10);

    // Mechanical alignment holes.
    body += alignmentHole(-2.89);
    body += alignmentHole(2.89);

    // USB-C contact row, at 0.5 mm pitch.
    //
    // Physical pad positions:
    //  1 GND, 2 VBUS, 3 SBU2, 4 CC1, 5 D-, 6 D-,
    //  7 D+, 8 D+, 9 SBU1, 10 CC2, 11 VBUS, 12 GND.
    //
    // SBU and CC are intentionally unconnected in this USB-2-only
    // footprint. A USB-C sink requires external 5.1 kΩ pull-down
    // resistors from both CC pins to GND.
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

    body += ')';
    return body;
  }
};