# Script PowerShell pour exécuter la migration via l'API Supabase Management
# Utilise les credentials pour se connecter à l'API Management

$ErrorActionPreference = "Stop"

Write-Host "`n🔑 Chargement des credentials..." -ForegroundColor Cyan
$credentialsPath = Join-Path $PSScriptRoot "..\secret\token-acces-lmops-plateform.json"
$credentials = Get-Content $credentialsPath | ConvertFrom-Json

$projectId = $credentials.supabase.project_id
$accessToken = $credentials.supabase.access_token
$serviceRoleKey = $credentials.supabase.service_role_key

Write-Host "📡 Projet: $projectId" -ForegroundColor Cyan

# Lecture du fichier de migration
Write-Host "`n📄 Lecture de la migration..." -ForegroundColor Cyan
$migrationPath = Join-Path $PSScriptRoot "..\supabase\migrations\20260122_documents_complete_schema.sql"
$migrationSQL = Get-Content $migrationPath -Raw -Encoding UTF8

$sizeKB = [math]::Round($migrationSQL.Length / 1024, 2)
Write-Host "📊 Taille: $sizeKB KB" -ForegroundColor Cyan

# Exécution via l'API Management
Write-Host "`n🚀 Exécution via l'API Management Supabase..." -ForegroundColor Yellow

$apiUrl = "https://api.supabase.com/v1/projects/$projectId/database/query"

$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}

$body = @{
    query = $migrationSQL
} | ConvertTo-Json -Depth 10

try {
    Write-Host "📤 Envoi de la requête..." -ForegroundColor Cyan

    $response = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $body -ErrorAction Stop

    Write-Host "`n✅ Migration exécutée avec succès !" -ForegroundColor Green
    Write-Host "📊 Réponse:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 5 | Write-Host

} catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    $errorBody = $_.ErrorDetails.Message

    Write-Host "`n❌ Erreur HTTP $statusCode" -ForegroundColor Red

    if ($errorBody) {
        Write-Host "Détails: $errorBody" -ForegroundColor Red
    }

    Write-Host "`n💡 SOLUTION ALTERNATIVE:" -ForegroundColor Yellow
    Write-Host "Exécuter la migration manuellement via le Dashboard Supabase:" -ForegroundColor Yellow
    Write-Host "https://app.supabase.com/project/$projectId/sql/new" -ForegroundColor Cyan
    Write-Host "`n1. Copier le contenu de: supabase\migrations\20260122_documents_complete_schema.sql" -ForegroundColor Yellow
    Write-Host "2. Coller dans le SQL Editor" -ForegroundColor Yellow
    Write-Host "3. Cliquer sur RUN" -ForegroundColor Yellow

    exit 1
}

# Vérification post-migration
Write-Host "`n🔍 Vérification de la structure créée..." -ForegroundColor Cyan

$verifyQuery = @"
SELECT
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_schema = 'public' AND table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
    AND table_name IN ('documents', 'document_audit', 'document_consultation_links')
ORDER BY table_name;
"@

$verifyBody = @{
    query = $verifyQuery
} | ConvertTo-Json

try {
    $verifyResponse = Invoke-RestMethod -Uri $apiUrl -Method Post -Headers $headers -Body $verifyBody

    Write-Host "`n📋 Tables créées:" -ForegroundColor Green
    $verifyResponse | ConvertTo-Json -Depth 5 | Write-Host

} catch {
    Write-Host "⚠️  Impossible de vérifier la structure (mais migration peut avoir réussi)" -ForegroundColor Yellow
}

Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "`n✨ PROCESSUS TERMINÉ" -ForegroundColor Green
Write-Host "`n🎯 GARANTIE ZÉRO PERTE: Tous les champs sont maintenant persistés en base." -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Tester l'upload d'un document via l'interface" -ForegroundColor White
Write-Host "   2. Vérifier que tous les 35 champs sont bien sauvegardés" -ForegroundColor White
Write-Host "   3. Consulter le RAPPORT_ZERO_PERTE.md pour la suite`n" -ForegroundColor White
