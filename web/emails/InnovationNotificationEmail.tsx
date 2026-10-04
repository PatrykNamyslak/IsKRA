import React from 'react'

export interface InnovationEmailTemplateProps {
  adminName?: string | null
  appUrl?: string
  innovation: {
    id?: string | number
    slug?: string | null
    title?: string | null
    creatorType?: string | null
    patientProblem?: string | null
    proposedSolution?: string | null
    targetGroup?: string | null
    careRequirements?: string | null
    supportNeeded?: string | null
    contactName?: string | null
    contactEmail?: string | null
    contactPhone?: string | null
    createdAt?: string | null
  }
}

// Colors sourced directly from web/tailwind.config.ts
export const TAILWIND_COLORS = {
  brand: {
    DEFAULT: '#e58500',
    hover: '#cc7700',
    orange: '#e58500',
    'orange-hover': '#cc7700',
  },
  iskra: {
    DEFAULT: '#e58500',
    hover: '#cc7700',
    orange: '#e58500',
    50: '#fffaf0',
    100: '#fef3dc',
    200: '#fde4b4',
    300: '#fccd82',
    400: '#faab47',
    500: '#e58500',
    600: '#cc7700',
    700: '#9f5600',
    800: '#753e05',
    900: '#4a2603',
  },
  grain: {
    1: '#d9d9d9',
    2: '#c6bda9',
    3: '#e7e7e7',
    bg: '#f5f5f7',
  },
} as const

const CREATOR_TYPE_MAP: Record<string, { label: string; color: string; bg: string; border: string }> = {
  application: {
    label: 'Wniosek o realizację',
    color: TAILWIND_COLORS.iskra[700], // #9f5600
    bg: TAILWIND_COLORS.iskra[50],     // #fffaf0
    border: TAILWIND_COLORS.iskra[200], // #fde4b4
  },
  matchmaking_gap: {
    label: 'Zgłoszenie nowej potrzeby (Gap)',
    color: TAILWIND_COLORS.iskra[800], // #753e05
    bg: TAILWIND_COLORS.iskra[100],    // #fef3dc
    border: TAILWIND_COLORS.iskra[300], // #fccd82
  },
  idea_exchange: {
    label: 'Giełda pomysłów',
    color: TAILWIND_COLORS.iskra[600], // #cc7700
    bg: TAILWIND_COLORS.iskra[50],     // #fffaf0
    border: TAILWIND_COLORS.iskra[400], // #faab47
  },
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * React Component for preview or Resend 'react:' property
 */
export const InnovationNotificationEmail: React.FC<InnovationEmailTemplateProps> = ({
  adminName,
  appUrl,
  innovation,
}) => {
  const baseUrl = appUrl ? appUrl.replace(/\/$/, '') : ''
  const typeMeta =
    (innovation.creatorType && CREATOR_TYPE_MAP[innovation.creatorType]) || {
      label: innovation.creatorType || 'Zgłoszenie publiczne',
      color: TAILWIND_COLORS.iskra[700],
      bg: TAILWIND_COLORS.iskra[50],
      border: TAILWIND_COLORS.iskra[200],
    }

  const detailUrl = innovation.slug
    ? `${baseUrl}/innovations/${encodeURIComponent(innovation.slug)}`
    : `${baseUrl}/innovations`

  const adminPanelUrl = innovation.id
    ? `${baseUrl}/admin/collections/innovations/${innovation.id}`
    : `${baseUrl}/admin/collections/innovations`

  return (
    <div
      style={{
        backgroundColor: TAILWIND_COLORS.grain.bg,
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        padding: '32px 16px',
        margin: '0 auto',
      }}
    >
      <table
        align="center"
        border={0}
        cellPadding={0}
        cellSpacing={0}
        width="100%"
        style={{
          maxWidth: '620px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${TAILWIND_COLORS.grain[3]}`,
        }}
      >
        {/* Header Bar */}
        <tbody>
          <tr>
            <td
              style={{
                backgroundColor: '#0f172a',
                padding: '24px 32px',
                borderBottom: `4px solid ${TAILWIND_COLORS.brand.DEFAULT}`,
              }}
            >
              <table width="100%" border={0} cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td>
                      <div
                        style={{
                          color: TAILWIND_COLORS.iskra[400],
                          fontSize: '11px',
                          fontWeight: 700,
                          letterSpacing: '1px',
                          textTransform: 'uppercase',
                          marginBottom: '4px',
                        }}
                      >
                        IsKRA • ROPS Województwo Małopolskie
                      </div>
                      <div
                        style={{
                          color: '#ffffff',
                          fontSize: '19px',
                          fontWeight: 700,
                          letterSpacing: '-0.3px',
                        }}
                      >
                        Platforma Innowacji Społecznych
                      </div>
                    </td>
                    <td align="right">
                      <span
                        style={{
                          display: 'inline-block',
                          backgroundColor: '#1e293b',
                          color: TAILWIND_COLORS.iskra[300],
                          fontSize: '12px',
                          fontWeight: 600,
                          padding: '6px 12px',
                          borderRadius: '20px',
                          border: `1px solid ${TAILWIND_COLORS.iskra[800]}`,
                        }}
                      >
                        Nowe zgłoszenie
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>

          {/* Main Body */}
          <tr>
            <td style={{ padding: '32px' }}>
              {/* Greeting */}
              <div
                style={{
                  fontSize: '15px',
                  color: '#475569',
                  marginBottom: '16px',
                }}
              >
                Cześć{adminName ? ` ${adminName}` : ''},
              </div>
              <div
                style={{
                  fontSize: '20px',
                  fontWeight: 700,
                  color: '#0f172a',
                  lineHeight: '1.3',
                  marginBottom: '8px',
                }}
              >
                Wpłynęła nowa innowacja na platformie
              </div>
              <p
                style={{
                  fontSize: '14px',
                  color: '#64748b',
                  margin: '0 0 24px 0',
                  lineHeight: '1.5',
                }}
              >
                Użytkownik dodał nowe zgłoszenie. Wymaga ono weryfikacji i oceny formalnej przez administratora ROPS.
              </p>

              {/* Innovation Card */}
              <div
                style={{
                  backgroundColor: TAILWIND_COLORS.iskra[50],
                  border: `1px solid ${TAILWIND_COLORS.iskra[200]}`,
                  borderLeft: `4px solid ${TAILWIND_COLORS.brand.DEFAULT}`,
                  borderRadius: '12px',
                  padding: '20px',
                  marginBottom: '24px',
                }}
              >
                {/* Pathway Tag */}
                <div style={{ marginBottom: '12px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: typeMeta.bg,
                      color: typeMeta.color,
                      border: `1px solid ${typeMeta.border}`,
                      fontSize: '12px',
                      fontWeight: 700,
                      padding: '4px 10px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                    }}
                  >
                    {typeMeta.label}
                  </span>
                </div>

                {/* Title */}
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: TAILWIND_COLORS.iskra[900],
                    marginBottom: '16px',
                  }}
                >
                  {innovation.title || 'Brak tytułu'}
                </div>

                {/* Problem Section */}
                <div style={{ marginBottom: '16px' }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: TAILWIND_COLORS.iskra[700],
                      letterSpacing: '0.5px',
                      marginBottom: '4px',
                    }}
                  >
                    Opis problemu / potrzeby:
                  </div>
                  <div
                    style={{
                      fontSize: '14px',
                      color: '#1e293b',
                      lineHeight: '1.6',
                      backgroundColor: '#ffffff',
                      border: `1px solid ${TAILWIND_COLORS.grain[2]}`,
                      borderRadius: '8px',
                      padding: '12px 14px',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {innovation.patientProblem || 'Brak opisu problemu'}
                  </div>
                </div>

                {/* Proposed Solution */}
                {innovation.proposedSolution && (
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 700,
                        textTransform: 'uppercase',
                        color: TAILWIND_COLORS.iskra[700],
                        letterSpacing: '0.5px',
                        marginBottom: '4px',
                      }}
                    >
                      Proponowane rozwiązanie:
                    </div>
                    <div
                      style={{
                        fontSize: '14px',
                        color: '#1e293b',
                        lineHeight: '1.6',
                        backgroundColor: '#ffffff',
                        border: `1px solid ${TAILWIND_COLORS.grain[2]}`,
                        borderRadius: '8px',
                        padding: '12px 14px',
                        whiteSpace: 'pre-wrap',
                      }}
                    >
                      {innovation.proposedSolution}
                    </div>
                  </div>
                )}

                {/* Target Group */}
                {innovation.targetGroup && (
                  <div style={{ marginBottom: '12px', fontSize: '13px', color: '#475569' }}>
                    <strong style={{ color: TAILWIND_COLORS.iskra[900] }}>Grupa docelowa: </strong>
                    {innovation.targetGroup}
                  </div>
                )}

                {/* Care Requirements */}
                {innovation.careRequirements && (
                  <div style={{ marginBottom: '12px', fontSize: '13px', color: '#475569' }}>
                    <strong style={{ color: TAILWIND_COLORS.iskra[900] }}>Wymagania opiekuńcze/medyczne: </strong>
                    {innovation.careRequirements}
                  </div>
                )}
              </div>

              {/* Submitter Info Card */}
              <div
                style={{
                  backgroundColor: '#ffffff',
                  border: `1px solid ${TAILWIND_COLORS.grain[3]}`,
                  borderRadius: '12px',
                  padding: '16px 20px',
                  marginBottom: '28px',
                }}
              >
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 700,
                    color: TAILWIND_COLORS.iskra[900],
                    marginBottom: '8px',
                  }}
                >
                  👤 Dane zgłaszającego:
                </div>
                <table width="100%" border={0} cellPadding={0} cellSpacing={0} style={{ fontSize: '13px', color: '#334155' }}>
                  <tbody>
                    <tr>
                      <td style={{ padding: '3px 0', width: '130px', color: '#64748b' }}>Imię / Nazwa:</td>
                      <td style={{ padding: '3px 0', fontWeight: 600 }}>
                        {innovation.contactName || 'Nie podano'}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', color: '#64748b' }}>E-mail:</td>
                      <td style={{ padding: '3px 0' }}>
                        {innovation.contactEmail ? (
                          <a
                            href={`mailto:${innovation.contactEmail}`}
                            style={{ color: TAILWIND_COLORS.brand.DEFAULT, textDecoration: 'none', fontWeight: 600 }}
                          >
                            {innovation.contactEmail}
                          </a>
                        ) : (
                          'Nie podano'
                        )}
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: '3px 0', color: '#64748b' }}>Telefon:</td>
                      <td style={{ padding: '3px 0' }}>
                        {innovation.contactPhone ? (
                          <a
                            href={`tel:${innovation.contactPhone}`}
                            style={{ color: TAILWIND_COLORS.brand.DEFAULT, textDecoration: 'none', fontWeight: 600 }}
                          >
                            {innovation.contactPhone}
                          </a>
                        ) : (
                          'Nie podano'
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Action Buttons */}
              <div style={{ textAlign: 'center', marginBottom: '8px' }}>
                <a
                  href={adminPanelUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: TAILWIND_COLORS.brand.DEFAULT,
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '12px 28px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    marginRight: '8px',
                    marginBottom: '8px',
                  }}
                >
                  Otwórz w panelu admina →
                </a>
                <a
                  href={detailUrl}
                  style={{
                    display: 'inline-block',
                    backgroundColor: '#ffffff',
                    color: TAILWIND_COLORS.iskra[900],
                    fontWeight: 600,
                    fontSize: '14px',
                    padding: '11px 22px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    border: `1px solid ${TAILWIND_COLORS.grain[2]}`,
                    marginBottom: '8px',
                  }}
                >
                  Podgląd publiczny
                </a>
              </div>
            </td>
          </tr>

          {/* Footer */}
          <tr>
            <td
              style={{
                backgroundColor: TAILWIND_COLORS.grain.bg,
                borderTop: `1px solid ${TAILWIND_COLORS.grain[3]}`,
                padding: '24px 32px',
                textAlign: 'center',
                fontSize: '12px',
                color: TAILWIND_COLORS.iskra[800],
                lineHeight: '1.6',
              }}
            >
              <div>IsKRA • Regionalny Ośrodek Polityki Społecznej w Krakowie (ROPS)</div>
              <div>System Innowacji Społecznych • Powiadomienie automatyczne dla administratorów</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

/**
 * Compiles the template directly into standard, resilient HTML string
 * for Resend's `html:` option.
 */
export function renderInnovationEmailHtml(props: InnovationEmailTemplateProps): string {
  const { adminName, appUrl, innovation } = props
  const baseUrl = appUrl ? appUrl.replace(/\/$/, '') : ''

  const typeMeta =
    (innovation.creatorType && CREATOR_TYPE_MAP[innovation.creatorType]) || {
      label: innovation.creatorType || 'Zgłoszenie publiczne',
      color: TAILWIND_COLORS.iskra[700],
      bg: TAILWIND_COLORS.iskra[50],
      border: TAILWIND_COLORS.iskra[200],
    }

  const detailUrl = innovation.slug
    ? `${baseUrl}/innovations/${encodeURIComponent(innovation.slug)}`
    : `${baseUrl}/innovations`

  const adminPanelUrl = innovation.id
    ? `${baseUrl}/admin/collections/innovations/${innovation.id}`
    : `${baseUrl}/admin/collections/innovations`

  return `
<!DOCTYPE html>
<html lang="pl">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nowa innowacja: ${escapeHtml(innovation.title || '')}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${TAILWIND_COLORS.grain.bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <div style="background-color: ${TAILWIND_COLORS.grain.bg}; padding: 32px 16px; margin: 0 auto;">
    <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05); border: 1px solid ${TAILWIND_COLORS.grain[3]};">
      <tbody>
        <tr>
          <td style="background-color: #0f172a; padding: 24px 32px; border-bottom: 4px solid ${TAILWIND_COLORS.brand.DEFAULT};">
            <table width="100%" border="0" cellpadding="0" cellspacing="0">
              <tbody>
                <tr>
                  <td>
                    <div style="color: ${TAILWIND_COLORS.iskra[400]}; font-size: 11px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 4px;">
                      IsKRA • ROPS Województwo Małopolskie
                    </div>
                    <div style="color: #ffffff; font-size: 19px; font-weight: 700; letter-spacing: -0.3px;">
                      Platforma Innowacji Społecznych
                    </div>
                  </td>
                  <td align="right">
                    <span style="display: inline-block; background-color: #1e293b; color: ${TAILWIND_COLORS.iskra[300]}; font-size: 12px; font-weight: 600; padding: 6px 12px; border-radius: 20px; border: 1px solid ${TAILWIND_COLORS.iskra[800]};">
                      Nowe zgłoszenie
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 32px;">
            <div style="font-size: 15px; color: #475569; margin-bottom: 16px;">
              Cześć${adminName ? ` ${escapeHtml(adminName)}` : ''},
            </div>
            <div style="font-size: 20px; font-weight: 700; color: #0f172a; line-height: 1.3; margin-bottom: 8px;">
              Wpłynęła nowa innowacja na platformie
            </div>
            <p style="font-size: 14px; color: #64748b; margin: 0 0 24px 0; line-height: 1.5;">
              Użytkownik dodał nowe zgłoszenie. Wymaga ono weryfikacji i oceny formalnej przez administratora ROPS.
            </p>

            <div style="background-color: ${TAILWIND_COLORS.iskra[50]}; border: 1px solid ${TAILWIND_COLORS.iskra[200]}; border-left: 4px solid ${TAILWIND_COLORS.brand.DEFAULT}; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <div style="margin-bottom: 12px;">
                <span style="display: inline-block; background-color: ${typeMeta.bg}; color: ${typeMeta.color}; border: 1px solid ${typeMeta.border}; font-size: 12px; font-weight: 700; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                  ${escapeHtml(typeMeta.label)}
                </span>
              </div>

              <div style="font-size: 18px; font-weight: 700; color: ${TAILWIND_COLORS.iskra[900]}; margin-bottom: 16px;">
                ${escapeHtml(innovation.title || 'Brak tytułu')}
              </div>

              <div style="margin-bottom: 16px;">
                <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${TAILWIND_COLORS.iskra[700]}; letter-spacing: 0.5px; margin-bottom: 4px;">
                  Opis problemu / potrzeby:
                </div>
                <div style="font-size: 14px; color: #1e293b; line-height: 1.6; background-color: #ffffff; border: 1px solid ${TAILWIND_COLORS.grain[2]}; border-radius: 8px; padding: 12px 14px; white-space: pre-wrap;">${escapeHtml(innovation.patientProblem || 'Brak opisu problemu')}</div>
              </div>

              ${
                innovation.proposedSolution
                  ? `<div style="margin-bottom: 16px;">
                      <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: ${TAILWIND_COLORS.iskra[700]}; letter-spacing: 0.5px; margin-bottom: 4px;">
                        Proponowane rozwiązanie:
                      </div>
                      <div style="font-size: 14px; color: #1e293b; line-height: 1.6; background-color: #ffffff; border: 1px solid ${TAILWIND_COLORS.grain[2]}; border-radius: 8px; padding: 12px 14px; white-space: pre-wrap;">${escapeHtml(
                        innovation.proposedSolution
                      )}</div>
                    </div>`
                  : ''
              }

              ${
                innovation.targetGroup
                  ? `<div style="margin-bottom: 12px; font-size: 13px; color: #475569;">
                      <strong style="color: ${TAILWIND_COLORS.iskra[900]};">Grupa docelowa: </strong> ${escapeHtml(
                        innovation.targetGroup
                      )}
                    </div>`
                  : ''
              }

              ${
                innovation.careRequirements
                  ? `<div style="margin-bottom: 12px; font-size: 13px; color: #475569;">
                      <strong style="color: ${TAILWIND_COLORS.iskra[900]};">Wymagania opiekuńcze/medyczne: </strong> ${escapeHtml(
                        innovation.careRequirements
                      )}
                    </div>`
                  : ''
              }
            </div>

            <div style="background-color: #ffffff; border: 1px solid ${TAILWIND_COLORS.grain[3]}; border-radius: 12px; padding: 16px 20px; margin-bottom: 28px;">
              <div style="font-size: 13px; font-weight: 700; color: ${TAILWIND_COLORS.iskra[900]}; margin-bottom: 8px;">
                👤 Dane zgłaszającego:
              </div>
              <table width="100%" border="0" cellpadding="0" cellspacing="0" style="font-size: 13px; color: #334155;">
                <tbody>
                  <tr>
                    <td style="padding: 3px 0; width: 130px; color: #64748b;">Imię / Nazwa:</td>
                    <td style="padding: 3px 0; font-weight: 600;">${escapeHtml(
                      innovation.contactName || 'Nie podano'
                    )}</td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #64748b;">E-mail:</td>
                    <td style="padding: 3px 0;">
                      ${
                        innovation.contactEmail
                          ? `<a href="mailto:${escapeHtml(
                              innovation.contactEmail
                            )}" style="color: ${TAILWIND_COLORS.brand.DEFAULT}; text-decoration: none; font-weight: 600;">${escapeHtml(
                              innovation.contactEmail
                            )}</a>`
                          : 'Nie podano'
                      }
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 3px 0; color: #64748b;">Telefon:</td>
                    <td style="padding: 3px 0;">
                      ${
                        innovation.contactPhone
                          ? `<a href="tel:${escapeHtml(
                              innovation.contactPhone
                            )}" style="color: ${TAILWIND_COLORS.brand.DEFAULT}; text-decoration: none; font-weight: 600;">${escapeHtml(
                              innovation.contactPhone
                            )}</a>`
                          : 'Nie podano'
                      }
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style="text-align: center; margin-bottom: 8px;">
              <a href="${adminPanelUrl}" style="display: inline-block; background-color: ${TAILWIND_COLORS.brand.DEFAULT}; color: #ffffff; font-weight: 600; font-size: 14px; padding: 12px 28px; border-radius: 8px; text-decoration: none; margin-right: 8px; margin-bottom: 8px;">
                Otwórz w panelu admina →
              </a>
              <a href="${detailUrl}" style="display: inline-block; background-color: #ffffff; color: ${TAILWIND_COLORS.iskra[900]}; font-weight: 600; font-size: 14px; padding: 11px 22px; border-radius: 8px; text-decoration: none; border: 1px solid ${TAILWIND_COLORS.grain[2]}; margin-bottom: 8px;">
                Podgląd publiczny
              </a>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background-color: ${TAILWIND_COLORS.grain.bg}; border-top: 1px solid ${TAILWIND_COLORS.grain[3]}; padding: 24px 32px; text-align: center; font-size: 12px; color: ${TAILWIND_COLORS.iskra[800]}; line-height: 1.6;">
            <div>IsKRA • Regionalny Ośrodek Polityki Społecznej w Krakowie (ROPS)</div>
            <div>System Innowacji Społecznych • Powiadomienie automatyczne dla administratorów</div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</body>
</html>
  `
}
