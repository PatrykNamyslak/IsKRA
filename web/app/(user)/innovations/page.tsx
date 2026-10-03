import { Button, Card } from "@heroui/react";
import Image from "next/image";

export default function page() {
  var test_data = [{
    "category": "Dla osób w kryzysie bezdomności",
    "color": "red",
    "items": [
      {
        "title": "Szlakiem ludzi bezdomnych",
        "description": "Mobilny Punkt Higieniczny, zapewniający osobom w kryzysie bezdomności łatwiejszy dostęp do usług higienicznych i czystą odzież na zmianę.",
        "license": "CC BY",
        "actions": [
          "pobierz materiały",
          "sprawdź zasady wykorzystania",
          "otwórz w telefonie"
        ]
      },
      {
        "title": "Wiejski program pomocy osobom w kryzysie bezdomności - Ścieżka Feniksa",
        "description": "Program pomocy dla osób znajdujących się w kryzysie bezdomności zakładający realizację procesu wychodzenia z bezdomności poprzez powrót w rodzinne strony, zamieszkanie na obszarze wiejskim oraz pracę na rzecz ośrodka ekologicznego, który może świadczyć dla społeczności lokalnej usługi rekreacji i odpoczynku.",
        "license": "CC BY",
        "actions": [
          "pobierz materiały",
          "sprawdź zasady wykorzystania",
          "otwórz w telefonie"
        ]
      }
    ]
  },
  {
    "category": "Dla zdrowia i medycyny",
    "color": "green",
    "items": [
      {
        "title": "Paszport pacjenta z chorobą rzadką",
        "description": "Paszport jest rozwiązaniem informatycznym, w ramach którego zapisane są najważniejsze informacje na temat choroby, leków, lekarzy prowadzących pacjenta z chorobą rzadką. Informacje te znajdują się na elektronicznym nośniku, który pacjent może zawsze mieć przy sobie.",
        "project": "INNOWACJA WYBRANA DO UPOWSZECHNIANIA W RAMACH PROJEKTU \"INKUBATOR DOSTĘPNOŚCI\"",
        "license": "CC BY",
        "actions": [
          "dowiedz się więcej",
          "zobacz film",
          "pobierz materiały",
          "sprawdź zasady wykorzystania",
          "otwórz w telefonie"
        ]
      },
      {
        "title": "Himalaje autyzmu",
        "description": "Metoda pracy z osobami neuroatypowymi (przede wszystkim ze spektrum autyzmu), które przejawiają zachowania nieakceptowane społecznie, w tym agresywne i autoagresywne mająca na celu przygotowanie pacjenta do wizyty lekarskiej, umożliwienie diagnozy schorzenia i podjęcie leczenia.",
        "project": "INNOWACJA WYBRANA DO UPOWSZECHNIANIA W RAMACH PROJEKTU \"INKUBATOR DOSTĘPNOŚCI\"",
        "license": "CC BY",
        "actions": [
          "dowiedz się więcej",
          "zobacz film",
          "pobierz materiały",
          "sprawdź zasady wykorzystania",
          "otwórz w telefonie"
        ]
      }
    ]
  }]

  const colorClasses: Record<string, string> = {
    blue: "bg-blue-200",
    red: "bg-red-200",
    green: "bg-green-200",
    yellow: "bg-yellow-200",
  };
  const actionIcon: Record<string, string> = {
    "dowiedz się więcej": "/icons/icon_learn_more.svg",
    "zobacz film": "/icons/icon_video.svg",
    "pobierz materiały": "/icons/icon_download.svg",
    "sprawdź zasady wykorzystania": "/icons/icon_rules.svg",
    "otwórz w telefonie": "/icons/icon_open_elsewhere.svg",
  };

  return (
    <div className="space-y-8">
      {test_data.map((category, categoryIndex) => (
        <section
          key={categoryIndex}
          className={`${colorClasses[category.color]} rounded-3xl p-6 shadow-sm`}
        >
          {/* Category header */}
          <div className="mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              {category.category}
            </h2>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {category.items.map((elem, itemIndex) => (
              <Card
                key={itemIndex}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/90 shadow-md backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white hover:shadow-xl"
              >
                <Card.Header className="space-y-3 p-6">
                  <Card.Title className="text-2xl font-semibold tracking-tight text-gray-900">
                    {elem.title}
                  </Card.Title>

                  <Card.Description className="text-sm leading-6 text-gray-600">
                    {elem.description}
                  </Card.Description>
                </Card.Header>

                <Card.Content className="flex flex-wrap gap-2 px-6 pb-6">
                  {elem.actions.map((action, actionIndex) => (
                    <Button
                      key={actionIndex}
                      className="flex items-center gap-2 rounded-lg bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200 hover:text-gray-900"
                    >
                      <img
                        src={actionIcon[action]}
                        alt=""
                        className="h-4 w-4 shrink-0"
                      />
                      {action}
                    </Button>
                  ))}
                </Card.Content>

                <Card.Footer className="mt-auto border-t border-gray-200/70 bg-gray-50/70 px-6 py-3">
                  <p className="text-xs text-gray-500">
                    {elem.license}
                  </p>
                </Card.Footer>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
