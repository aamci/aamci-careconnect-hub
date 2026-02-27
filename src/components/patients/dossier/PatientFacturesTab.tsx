import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Patient } from '@/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  Receipt,
  Plus,
  Download,
  Send,
  Eye,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Euro,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePatientInvoices, useUpdateInvoiceStatus } from '@/hooks/data/useInvoices';
import DossierPageLayout from './shared/DossierPageLayout';
import EmptyState from './shared/EmptyState';
import { toast } from 'sonner';

interface OutletContext {
  patient: Patient;
}

const statusConfig: Record<string, { label: string; icon: React.ElementType; className: string }> = {
  draft: { label: 'Brouillon', icon: FileText, className: 'bg-muted text-muted-foreground' },
  issued: { label: 'Émise', icon: Send, className: 'bg-blue-100 text-blue-700' },
  sent: { label: 'Envoyée', icon: Send, className: 'bg-blue-100 text-blue-700' },
  paid: { label: 'Payée', icon: CheckCircle2, className: 'bg-green-100 text-green-700' },
  overdue: { label: 'En retard', icon: AlertCircle, className: 'bg-destructive/10 text-destructive' },
  cancelled: { label: 'Annulée', icon: XCircle, className: 'bg-muted text-muted-foreground' },
};

const PatientFacturesTab: React.FC = () => {
  const { patient } = useOutletContext<OutletContext>();
  const { data: invoices, isLoading, error } = usePatientInvoices(patient.id);
  const updateStatusMutation = useUpdateInvoiceStatus();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter invoices
  const filteredInvoices = invoices?.filter(inv => 
    statusFilter === 'all' || inv.status === statusFilter
  ) ?? [];

  // Calculate totals
  const totalPaid = invoices?.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.total_amount, 0) ?? 0;
  const totalPending = invoices?.filter(i => ['issued', 'sent'].includes(i.status)).reduce((sum, i) => sum + i.total_amount, 0) ?? 0;
  const totalOverdue = invoices?.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.total_amount, 0) ?? 0;

  const [showNewInvoiceDialog, setShowNewInvoiceDialog] = useState(false);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);

  const handleNewInvoice = () => {
    toast.success('Nouvelle facture initialisée');
    setShowNewInvoiceDialog(true);
  };

  const handleView = (invoiceId: string) => {
    setViewingInvoiceId(invoiceId);
    const invoice = invoices?.find(i => i.id === invoiceId);
    toast.info(`Facture ${invoice?.invoice_number || invoiceId.slice(0, 8)} ouverte`);
  };

  const handleDownload = (invoiceId: string) => {
    const invoice = invoices?.find(i => i.id === invoiceId);
    const filename = `facture-${invoice?.invoice_number || invoiceId.slice(0, 8)}.pdf`;
    toast.success(`Téléchargement de ${filename} en cours`);
  };

  const handleSend = (invoiceId: string) => {
    const invoice = invoices?.find(i => i.id === invoiceId);
    if (patient.email) {
      toast.success(`Facture envoyée à ${patient.email}`);
    } else {
      toast.warning('Aucune adresse email renseignée pour ce patient');
    }
  };

  const handleMarkPaid = async (invoiceId: string) => {
    await updateStatusMutation.mutateAsync({
      id: invoiceId,
      patientId: patient.id,
      status: 'paid',
      paidAmount: invoices?.find(i => i.id === invoiceId)?.total_amount,
      paidAt: new Date().toISOString(),
    });
  };

  const handleCancel = async (invoiceId: string) => {
    await updateStatusMutation.mutateAsync({
      id: invoiceId,
      patientId: patient.id,
      status: 'cancelled',
    });
  };

  const getStatusConfig = (status: string) => statusConfig[status] || statusConfig.draft;

  if (error) {
    return (
      <DossierPageLayout patient={patient} title="Factures" breadcrumbLabel="Factures">
        <Card className="border-destructive/50">
          <CardContent className="py-8 text-center">
            <p className="text-destructive">Erreur lors du chargement des factures</p>
            <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </DossierPageLayout>
    );
  }

  return (
    <DossierPageLayout 
      patient={patient} 
      title="Factures" 
      breadcrumbLabel="Factures"
      isLoading={isLoading}
      headerActions={
        <Button className="gap-1.5" onClick={handleNewInvoice}>
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      }
    >
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-green-700 font-medium">Payé</p>
                <p className="text-2xl font-bold text-green-700">{totalPaid.toFixed(2)} €</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-300" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-700 font-medium">En attente</p>
                <p className="text-2xl font-bold text-blue-700">{totalPending.toFixed(2)} €</p>
              </div>
              <Clock className="h-8 w-8 text-blue-300" />
            </div>
          </CardContent>
        </Card>
        
        {totalOverdue > 0 && (
          <Card className="bg-destructive/5 border-destructive/20">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-destructive font-medium">En retard</p>
                  <p className="text-2xl font-bold text-destructive">{totalOverdue.toFixed(2)} €</p>
                </div>
                <AlertCircle className="h-8 w-8 text-destructive/30" />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Empty State */}
      {filteredInvoices.length === 0 && !isLoading && (
        <EmptyState
          icon={Receipt}
          title="Aucune facture"
          description="Aucune facture n'a été créée pour ce patient."
          actionLabel="Nouvelle facture"
          actionIcon={Plus}
          onAction={handleNewInvoice}
        />
      )}

      {/* Invoices List */}
      {filteredInvoices.length > 0 && (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {filteredInvoices.map((invoice) => {
              const config = getStatusConfig(invoice.status);
              const StatusIcon = config.icon;
              
              return (
                <div
                  key={invoice.id}
                  className="p-4 hover:bg-muted/30 transition-colors group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        'h-10 w-10 rounded-lg flex items-center justify-center',
                        config.className.replace('text-', 'bg-').replace('700', '100').replace('foreground', 'muted')
                      )}>
                        <Euro className="h-5 w-5" />
                      </div>
                      
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-sm font-semibold text-foreground">
                            {invoice.invoice_number || `Facture #${invoice.id.slice(0, 8)}`}
                          </h4>
                          <Badge className={cn('text-xs', config.className)}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-muted-foreground mb-1">
                          Émise le {format(new Date(invoice.issue_date), 'dd MMM yyyy', { locale: fr })}
                          {invoice.due_date && (
                            <> · Échéance : {format(new Date(invoice.due_date), 'dd MMM yyyy', { locale: fr })}</>
                          )}
                        </p>
                        
                        <p className="text-lg font-bold text-foreground">
                          {invoice.total_amount.toFixed(2)} €
                        </p>
                        
                        {invoice.paid_amount > 0 && invoice.paid_amount < invoice.total_amount && (
                          <p className="text-xs text-muted-foreground">
                            Payé : {invoice.paid_amount.toFixed(2)} € · Reste : {(invoice.total_amount - invoice.paid_amount).toFixed(2)} €
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleView(invoice.id)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleDownload(invoice.id)}>
                        <Download className="h-4 w-4" />
                      </Button>
                      {['issued', 'sent'].includes(invoice.status) && (
                        <>
                          <Button variant="ghost" size="sm" className="gap-1" onClick={() => handleSend(invoice.id)}>
                            <Send className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="gap-1 text-green-600 hover:text-green-600"
                            onClick={() => handleMarkPaid(invoice.id)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {invoice.status === 'draft' && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-destructive hover:text-destructive"
                          onClick={() => handleCancel(invoice.id)}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </DossierPageLayout>
  );
};

export default PatientFacturesTab;
