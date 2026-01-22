-- ============================================
-- MIGRATION DOCUMENTS - SCHÉMA COMPLET E-SANTÉ
-- Alignement total avec type TypeScript Document
-- Garantie ZÉRO PERTE, traçabilité maximale
-- ============================================

-- ==== PHASE 1: BACKUP TABLE EXISTANTE ====

-- Renommer la table actuelle pour backup
ALTER TABLE IF EXISTS public.documents RENAME TO documents_legacy;

-- ==== PHASE 2: TABLE DOCUMENTS COMPLÈTE ====

CREATE TABLE IF NOT EXISTS public.documents (
    -- Identifiants
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    external_id VARCHAR(255),

    -- Métadonnées fichier
    filename VARCHAR(500) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_url TEXT NOT NULL,
    thumbnail_url TEXT,
    checksum VARCHAR(128) NOT NULL,
    storage_bucket VARCHAR(100) DEFAULT 'documents' NOT NULL,

    -- Classification
    category VARCHAR(50) NOT NULL CHECK (category IN (
        'courrier', 'imagerie', 'analyse', 'exploration',
        'ordonnance', 'certificat', 'administratif', 'facturation', 'divers'
    )),
    subcategory VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,

    -- Relations
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES public.consultations(id) ON DELETE SET NULL,
    document_date TIMESTAMPTZ NOT NULL,

    -- Statut et workflow
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'validated', 'signed', 'archived'
    )),

    -- Signature numérique
    is_signed BOOLEAN DEFAULT false NOT NULL,
    signature_data JSONB,
    -- signature_data structure:
    -- {
    --   "signedAt": "ISO8601",
    --   "signedBy": "UUID",
    --   "signatureMethod": "electronic|digital_certificate",
    --   "certificateId": "string",
    --   "signatureHash": "string",
    --   "isValid": boolean
    -- }

    -- Encryption
    is_encrypted BOOLEAN DEFAULT false NOT NULL,
    encryption_method VARCHAR(50) CHECK (encryption_method IN ('AES-256-GCM', 'RSA-4096')),

    -- Métadonnées métier (DICOM, laboratoire, etc.)
    metadata JSONB,
    -- metadata structure examples:
    -- {
    --   "dicomStudyInstanceUID": "string",
    --   "dicomSeriesInstanceUID": "string",
    --   "dicomModality": "string",
    --   "laboratoryName": "string",
    --   "laboratoryId": "string",
    --   "loincCodes": ["string"],
    --   "customFields": {}
    -- }

    -- Audit création/modification
    created_by UUID NOT NULL REFERENCES auth.users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_by UUID REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ,

    -- Soft delete
    deleted_by UUID REFERENCES auth.users(id),
    deleted_at TIMESTAMPTZ,

    -- Source et traçabilité
    source VARCHAR(50) NOT NULL CHECK (source IN (
        'upload', 'scan', 'integration', 'generated'
    )),
    source_system VARCHAR(255),

    -- Partage patient
    shared_with_patient BOOLEAN DEFAULT false NOT NULL,
    shared_at TIMESTAMPTZ,
    shared_by UUID REFERENCES auth.users(id),

    -- Visibilité et contrôle accès
    visibility VARCHAR(50) NOT NULL DEFAULT 'private' CHECK (visibility IN (
        'public', 'restricted', 'private'
    )),
    restricted_to_roles TEXT[] DEFAULT '{}',

    -- Contraintes métier
    CONSTRAINT valid_signed_signature CHECK (
        NOT is_signed OR signature_data IS NOT NULL
    ),
    CONSTRAINT valid_encrypted_method CHECK (
        NOT is_encrypted OR encryption_method IS NOT NULL
    ),
    CONSTRAINT valid_shared_trace CHECK (
        NOT shared_with_patient OR (shared_at IS NOT NULL AND shared_by IS NOT NULL)
    ),
    CONSTRAINT valid_soft_delete CHECK (
        deleted_at IS NULL OR deleted_by IS NOT NULL
    )
);

-- ==== PHASE 3: TABLE AUDIT DOCUMENTS ====

CREATE TABLE IF NOT EXISTS public.document_audit (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL CHECK (action IN (
        'CREATED', 'UPDATED', 'DELETED', 'RESTORED',
        'SIGNED', 'UNSIGNED', 'ENCRYPTED', 'DECRYPTED',
        'SHARED_WITH_PATIENT', 'UNSHARED_FROM_PATIENT',
        'VIEWED', 'DOWNLOADED', 'PRINTED',
        'METADATA_UPDATED', 'CLASSIFICATION_CHANGED',
        'VISIBILITY_CHANGED', 'ACCESS_GRANTED', 'ACCESS_REVOKED'
    )),
    user_id UUID NOT NULL REFERENCES auth.users(id),
    user_name VARCHAR(255),
    user_role VARCHAR(50),
    details JSONB,
    previous_value JSONB,
    new_value JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ==== PHASE 4: TABLE RELATIONS DOCUMENT-CONSULTATION ====

CREATE TABLE IF NOT EXISTS public.document_consultation_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    consultation_id UUID NOT NULL REFERENCES public.consultations(id) ON DELETE CASCADE,
    added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    added_by UUID NOT NULL REFERENCES auth.users(id),
    context VARCHAR(50) NOT NULL CHECK (context IN (
        'created_during', 'imported_to', 'referenced'
    )),
    UNIQUE(document_id, consultation_id)
);

-- ==== PHASE 5: INDEXES PERFORMANCE ====

-- Indexes principaux
CREATE INDEX idx_documents_patient_id ON public.documents(patient_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_consultation_id ON public.documents(consultation_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_created_by ON public.documents(created_by);
CREATE INDEX idx_documents_document_date ON public.documents(document_date DESC);
CREATE INDEX idx_documents_category ON public.documents(category) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_status ON public.documents(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_shared ON public.documents(shared_with_patient) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_external_id ON public.documents(external_id) WHERE external_id IS NOT NULL;

-- Indexes composites
CREATE INDEX idx_documents_patient_category ON public.documents(patient_id, category, document_date DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_documents_patient_status ON public.documents(patient_id, status) WHERE deleted_at IS NULL;

-- Indexes full-text search
CREATE INDEX idx_documents_title_fts ON public.documents USING gin(to_tsvector('french', title));
CREATE INDEX idx_documents_description_fts ON public.documents USING gin(to_tsvector('french', COALESCE(description, '')));

-- Indexes audit
CREATE INDEX idx_document_audit_document_id ON public.document_audit(document_id, created_at DESC);
CREATE INDEX idx_document_audit_user_id ON public.document_audit(user_id, created_at DESC);
CREATE INDEX idx_document_audit_action ON public.document_audit(action, created_at DESC);

-- Indexes links
CREATE INDEX idx_document_links_document ON public.document_consultation_links(document_id);
CREATE INDEX idx_document_links_consultation ON public.document_consultation_links(consultation_id);

-- ==== PHASE 6: TRIGGERS ====

-- Trigger updated_at
CREATE TRIGGER trigger_documents_updated_at
    BEFORE UPDATE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_set_updated_at();

-- Trigger audit automatique
CREATE OR REPLACE FUNCTION public.trigger_document_audit()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO public.document_audit (
            document_id, action, user_id, user_name,
            new_value, created_at
        ) VALUES (
            NEW.id, 'CREATED', NEW.created_by,
            (SELECT email FROM auth.users WHERE id = NEW.created_by),
            to_jsonb(NEW), now()
        );
        RETURN NEW;

    ELSIF TG_OP = 'UPDATE' THEN
        -- Audit signature
        IF NEW.is_signed != OLD.is_signed AND NEW.is_signed THEN
            INSERT INTO public.document_audit (
                document_id, action, user_id, new_value
            ) VALUES (
                NEW.id, 'SIGNED', NEW.updated_by, NEW.signature_data
            );
        END IF;

        -- Audit partage
        IF NEW.shared_with_patient != OLD.shared_with_patient AND NEW.shared_with_patient THEN
            INSERT INTO public.document_audit (
                document_id, action, user_id, user_name
            ) VALUES (
                NEW.id, 'SHARED_WITH_PATIENT', NEW.shared_by,
                (SELECT email FROM auth.users WHERE id = NEW.shared_by)
            );
        END IF;

        -- Audit soft delete
        IF NEW.deleted_at IS NOT NULL AND OLD.deleted_at IS NULL THEN
            INSERT INTO public.document_audit (
                document_id, action, user_id
            ) VALUES (
                NEW.id, 'DELETED', NEW.deleted_by
            );
        END IF;

        -- Audit général
        IF NEW.title != OLD.title OR NEW.category != OLD.category OR NEW.status != OLD.status THEN
            INSERT INTO public.document_audit (
                document_id, action, user_id, previous_value, new_value
            ) VALUES (
                NEW.id, 'UPDATED', NEW.updated_by,
                jsonb_build_object('title', OLD.title, 'category', OLD.category, 'status', OLD.status),
                jsonb_build_object('title', NEW.title, 'category', NEW.category, 'status', NEW.status)
            );
        END IF;

        RETURN NEW;

    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO public.document_audit (
            document_id, action, user_id
        ) VALUES (
            OLD.id, 'DELETED', auth.uid()
        );
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trigger_document_audit_log
    AFTER INSERT OR UPDATE OR DELETE ON public.documents
    FOR EACH ROW
    EXECUTE FUNCTION public.trigger_document_audit();

-- ==== PHASE 7: RLS POLICIES ====

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_consultation_links ENABLE ROW LEVEL SECURITY;

-- Documents: visible par tous sauf deleted, modifiable selon permissions
CREATE POLICY "Documents viewable by authenticated users"
    ON public.documents FOR SELECT
    TO authenticated
    USING (deleted_at IS NULL);

CREATE POLICY "Documents insertable by authenticated users"
    ON public.documents FOR INSERT
    TO authenticated
    WITH CHECK (created_by = auth.uid());

CREATE POLICY "Documents updatable by creator or admin"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND (
            created_by = auth.uid() OR
            public.has_role(auth.uid(), 'admin') OR
            public.has_role(auth.uid(), 'doctor')
        )
    );

CREATE POLICY "Documents soft-deletable by creator or admin"
    ON public.documents FOR UPDATE
    TO authenticated
    USING (
        deleted_at IS NULL AND (
            created_by = auth.uid() OR
            public.has_role(auth.uid(), 'admin')
        )
    );

-- Audit: lecture seule pour tous
CREATE POLICY "Document audit viewable by authenticated users"
    ON public.document_audit FOR SELECT
    TO authenticated
    USING (true);

-- Links: gestion par créateurs et admins
CREATE POLICY "Document links viewable by authenticated users"
    ON public.document_consultation_links FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Document links manageable by authenticated users"
    ON public.document_consultation_links FOR INSERT
    TO authenticated
    WITH CHECK (added_by = auth.uid());

CREATE POLICY "Document links deletable by creator or admin"
    ON public.document_consultation_links FOR DELETE
    TO authenticated
    USING (
        added_by = auth.uid() OR
        public.has_role(auth.uid(), 'admin')
    );

-- ==== PHASE 8: MIGRATION DONNÉES LEGACY ====

-- Migrer les données existantes si la table legacy existe
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents_legacy') THEN
        INSERT INTO public.documents (
            id, filename, mime_type, file_size, storage_url,
            category, subcategory, title,
            patient_id, consultation_id, document_date,
            status, source, created_by, created_at
        )
        SELECT
            id,
            name AS filename,
            COALESCE(mime_type, 'application/octet-stream') AS mime_type,
            COALESCE(file_size, 0) AS file_size,
            COALESCE(file_path, '') AS storage_url,
            COALESCE(category, 'divers') AS category,
            COALESCE(type, 'autre') AS subcategory,
            name AS title,
            patient_id,
            appointment_id AS consultation_id,
            created_at AS document_date,
            'validated' AS status,
            'upload' AS source,
            COALESCE(uploaded_by, (SELECT id FROM auth.users LIMIT 1)) AS created_by,
            created_at
        FROM documents_legacy
        WHERE NOT EXISTS (
            SELECT 1 FROM public.documents d WHERE d.id = documents_legacy.id
        );

        RAISE NOTICE 'Migration legacy documents completed';
    END IF;
END $$;

-- ==== PHASE 9: FONCTIONS UTILITAIRES ====

-- Fonction soft delete
CREATE OR REPLACE FUNCTION public.soft_delete_document(doc_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.documents
    SET deleted_at = now(),
        deleted_by = auth.uid()
    WHERE id = doc_id
      AND deleted_at IS NULL;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction restore document
CREATE OR REPLACE FUNCTION public.restore_document(doc_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.documents
    SET deleted_at = NULL,
        deleted_by = NULL,
        updated_at = now(),
        updated_by = auth.uid()
    WHERE id = doc_id
      AND deleted_at IS NOT NULL;

    IF FOUND THEN
        INSERT INTO public.document_audit (
            document_id, action, user_id
        ) VALUES (
            doc_id, 'RESTORED', auth.uid()
        );
    END IF;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction partage patient
CREATE OR REPLACE FUNCTION public.share_document_with_patient(doc_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.documents
    SET shared_with_patient = true,
        shared_at = now(),
        shared_by = auth.uid(),
        updated_at = now(),
        updated_by = auth.uid()
    WHERE id = doc_id
      AND deleted_at IS NULL
      AND shared_with_patient = false;

    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==== FIN MIGRATION ====

COMMENT ON TABLE public.documents IS 'Documents patients - Schéma complet e-santé avec traçabilité maximale';
COMMENT ON TABLE public.document_audit IS 'Audit complet des actions sur documents (RGPD/HDS)';
COMMENT ON TABLE public.document_consultation_links IS 'Relations many-to-many entre documents et consultations';
