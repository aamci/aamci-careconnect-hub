import React from 'react';
import { FileText, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { mockConsignes, mockQuestions } from '@/data/settingsMockData';

const SyntheseConsignes: React.FC = () => {
  const activeConsignes = mockConsignes.filter((c) => c.isActive);
  const activeQuestions = mockQuestions.filter((q) => q.isActive);

  return (
    <div className="max-w-4xl">
      <h1 className="text-lg font-bold text-foreground mb-6">
        Synthese des consignes et questions
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm text-blue-800">
        <p>
          Cette page recapitule toutes les consignes et questions actives associees a vos motifs de consultation.
          Les modifications se font depuis les pages Consignes et Questions respectivement.
        </p>
      </div>

      {/* Consignes Summary */}
      <section className="mb-8">
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Consignes actives ({activeConsignes.length})
        </h2>
        {activeConsignes.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune consigne active.</p>
        ) : (
          <div className="space-y-3">
            {activeConsignes.map((c) => (
              <Card key={c.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{c.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{c.content}</p>
                    </div>
                    <Badge variant="outline" className="text-xs capitalize flex-shrink-0">
                      {c.type === 'before' ? 'Avant RDV' : c.type === 'after' ? 'Apres RDV' : 'Avant et apres'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Questions Summary */}
      <section>
        <h2 className="text-base font-semibold mb-4 flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          Questions actives ({activeQuestions.length})
        </h2>
        {activeQuestions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune question active.</p>
        ) : (
          <div className="space-y-3">
            {activeQuestions.map((q) => (
              <Card key={q.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium">{q.question}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Type: {q.type === 'yesno' ? 'Oui/Non' : q.type === 'text' ? 'Texte libre' : q.type === 'choice' ? 'Choix multiple' : 'Nombre'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {q.isRequired && (
                        <Badge variant="destructive" className="text-xs">Obligatoire</Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default SyntheseConsignes;
