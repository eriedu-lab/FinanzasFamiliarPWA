"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Interfaz de respaldo
=====================================
*/

const BackupUI = {

    elements: {},

    selectedBackup: null,

    initialize() {

        this.injectStyles();

        const moreView =
            document.getElementById(
                "view-mas"
            );

        if (!moreView) {

            console.error(
                "No se encontró la vista Más."
            );

            return;

        }

        if (
            document.getElementById(
                "backup-section"
            )
        ) {

            return;

        }

        const section =
            document.createElement(
                "section"
            );

        section.id =
            "backup-section";

        section.className =
            "backup-section";

        section.innerHTML = `

            <div class="backup-header">

                <div>

                    <p class="backup-eyebrow">
                        Seguridad de datos
                    </p>

                    <h2>
                        Respaldo y restauración
                    </h2>

                    <p>
                        Guarda una copia completa de tus datos o recupera un respaldo anterior.
                    </p>

                </div>

                <span
                    class="backup-icon"
                    aria-hidden="true"
                >
                    💾
                </span>

            </div>

            <div class="backup-actions-grid">

                <article class="backup-action-card">

                    <div
                        class="backup-action-symbol"
                        aria-hidden="true"
                    >
                        📤
                    </div>

                    <h3>
                        Exportar respaldo
                    </h3>

                    <p>
                        Descarga un archivo JSON con toda la información guardada en este dispositivo.
                    </p>

                    <button
                        id="export-backup-button"
                        class="backup-primary-button"
                        type="button"
                    >
                        Exportar respaldo
                    </button>

                </article>

                <article class="backup-action-card">

                    <div
                        class="backup-action-symbol"
                        aria-hidden="true"
                    >
                        📥
                    </div>

                    <h3>
                        Restaurar respaldo
                    </h3>

                    <p>
                        Selecciona un respaldo anterior. Los datos actuales serán reemplazados.
                    </p>

                    <input
                        id="backup-file-input"
                        type="file"
                        accept=".json,application/json"
                        hidden
                    >

                    <button
                        id="choose-backup-button"
                        class="backup-secondary-button"
                        type="button"
                    >
                        Seleccionar archivo
                    </button>

                </article>

            </div>

            <div
                id="backup-file-preview"
                class="backup-file-preview"
                hidden
            ></div>

            <p
                id="backup-message"
                class="backup-message"
                hidden
                role="status"
            ></p>

            <div class="backup-warning">

                <strong>
                    Importante:
                </strong>

                Guarda el archivo en iCloud Drive, Google Drive o en otra ubicación segura.

            </div>

        `;

        moreView.appendChild(section);

        this.elements = {

            section,

            exportButton:
                document.getElementById(
                    "export-backup-button"
                ),

            chooseButton:
                document.getElementById(
                    "choose-backup-button"
                ),

            fileInput:
                document.getElementById(
                    "backup-file-input"
                ),

            preview:
                document.getElementById(
                    "backup-file-preview"
                ),

            message:
                document.getElementById(
                    "backup-message"
                )

        };

        this.configureEvents();

    },

    configureEvents() {

        this.elements.exportButton
            ?.addEventListener(
                "click",
                () => {

                    this.exportBackup();

                }
            );

        this.elements.chooseButton
            ?.addEventListener(
                "click",
                () => {

                    this.elements.fileInput
                        .click();

                }
            );

        this.elements.fileInput
            ?.addEventListener(
                "change",
                event => {

                    const file =
                        event.target.files?.[0];

                    this.prepareRestore(
                        file
                    );

                }
            );

    },

    exportBackup() {

        try {

            const result =
                BackupManager.exportBackup();

            this.showMessage(
                `Respaldo creado correctamente. Se incluyeron ${result.backup.itemCount} grupos de datos.`,
                "success"
            );

        } catch (error) {

            this.showMessage(
                "No fue posible crear el respaldo.",
                "error"
            );

        }

    },

    async prepareRestore(file) {

        this.selectedBackup =
            null;

        this.elements.preview.hidden =
            true;

        this.clearMessage();

        const result =
            await BackupManager
                .readBackupFile(file);

        if (!result.success) {

            this.showMessage(
                result.message,
                "error"
            );

            this.elements.fileInput.value =
                "";

            return;

        }

        this.selectedBackup =
            result.backup;

        this.renderPreview(
            result.backup,
            file.name
        );

    },

    renderPreview(
        backup,
        fileName
    ) {

        this.elements.preview.innerHTML = `

            <div class="backup-preview-header">

                <div>

                    <strong>
                        Archivo listo para restaurar
                    </strong>

                    <span>
                        ${this.escapeHTML(fileName)}
                    </span>

                </div>

                <span class="backup-valid-badge">
                    Válido
                </span>

            </div>

            <dl class="backup-details">

                <div>

                    <dt>
                        Creado
                    </dt>

                    <dd>
                        ${this.escapeHTML(
                            BackupManager.formatDate(
                                backup.createdAt
                            )
                        )}
                    </dd>

                </div>

                <div>

                    <dt>
                        Grupos de datos
                    </dt>

                    <dd>
                        ${Number(
                            backup.itemCount ??
                            Object.keys(
                                backup.data
                            ).length
                        )}
                    </dd>

                </div>

            </dl>

            <button
                id="confirm-restore-button"
                class="backup-danger-button"
                type="button"
            >
                Restaurar y reemplazar datos
            </button>

        `;

        this.elements.preview.hidden =
            false;

        document
            .getElementById(
                "confirm-restore-button"
            )
            ?.addEventListener(
                "click",
                () => {

                    this.confirmRestore();

                }
            );

    },

    confirmRestore() {

        if (!this.selectedBackup) {

            this.showMessage(
                "Primero selecciona un respaldo válido.",
                "error"
            );

            return;

        }

        const confirmed =
            window.confirm(
                "La restauración reemplazará todos los datos actuales de Finanzas Familiar. ¿Deseas continuar?"
            );

        if (!confirmed) {

            return;

        }

        const secondConfirmation =
            window.confirm(
                "Esta acción no se puede deshacer. ¿Confirmas que deseas restaurar el respaldo?"
            );

        if (!secondConfirmation) {

            return;

        }

        const result =
            BackupManager.restoreBackup(
                this.selectedBackup
            );

        if (!result.success) {

            this.showMessage(
                result.message,
                "error"
            );

            return;

        }

        this.showMessage(
            `Respaldo restaurado correctamente. Se recuperaron ${result.restoredItems} grupos de datos. La aplicación se reiniciará.`,
            "success"
        );

        setTimeout(
            function () {

                window.location.reload();

            },
            1600
        );

    },

    showMessage(
        message,
        type
    ) {

        this.elements.message.textContent =
            message;

        this.elements.message.className =
            `backup-message ${type}`;

        this.elements.message.hidden =
            false;

    },

    clearMessage() {

        this.elements.message.textContent =
            "";

        this.elements.message.hidden =
            true;

    },

    escapeHTML(value) {

        const element =
            document.createElement(
                "div"
            );

        element.textContent =
            String(value || "");

        return element.innerHTML;

    },

    injectStyles() {

        if (
            document.getElementById(
                "backup-module-styles"
            )
        ) {

            return;

        }

        const style =
            document.createElement(
                "style"
            );

        style.id =
            "backup-module-styles";

        style.textContent = `

            .backup-section {
                margin-top: 24px;
                padding: 22px;
                border: 1px solid rgba(148, 163, 184, 0.25);
                border-radius: 22px;
                background: var(--surface-color, #ffffff);
                box-shadow: 0 14px 35px rgba(15, 23, 42, 0.08);
            }

            .backup-header {
                display: flex;
                align-items: flex-start;
                justify-content: space-between;
                gap: 18px;
                margin-bottom: 20px;
            }

            .backup-header h2 {
                margin: 4px 0 6px;
            }

            .backup-header p {
                margin: 0;
                color: #64748b;
                line-height: 1.55;
            }

            .backup-eyebrow {
                color: #2563eb !important;
                font-size: 0.78rem;
                font-weight: 800;
                letter-spacing: 0.08em;
                text-transform: uppercase;
            }

            .backup-icon {
                display: grid;
                width: 52px;
                height: 52px;
                place-items: center;
                border-radius: 16px;
                background: #eff6ff;
                font-size: 1.6rem;
            }

            .backup-actions-grid {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 16px;
            }

            .backup-action-card {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                min-height: 225px;
                padding: 20px;
                border: 1px solid #e2e8f0;
                border-radius: 18px;
                background: #f8fafc;
            }

            .backup-action-symbol {
                margin-bottom: 12px;
                font-size: 1.7rem;
            }

            .backup-action-card h3 {
                margin: 0 0 8px;
            }

            .backup-action-card p {
                flex: 1;
                margin: 0 0 18px;
                color: #64748b;
                line-height: 1.55;
            }

            .backup-primary-button,
            .backup-secondary-button,
            .backup-danger-button {
                width: 100%;
                padding: 12px 16px;
                border: 0;
                border-radius: 12px;
                cursor: pointer;
                font: inherit;
                font-weight: 800;
            }

            .backup-primary-button {
                color: #ffffff;
                background: #2563eb;
            }

            .backup-secondary-button {
                color: #1d4ed8;
                background: #dbeafe;
            }

            .backup-danger-button {
                margin-top: 18px;
                color: #ffffff;
                background: #dc2626;
            }

            .backup-file-preview {
                margin-top: 18px;
                padding: 18px;
                border: 1px solid #bbf7d0;
                border-radius: 16px;
                background: #f0fdf4;
            }

            .backup-preview-header {
                display: flex;
                justify-content: space-between;
                gap: 14px;
            }

            .backup-preview-header div {
                display: grid;
                gap: 4px;
            }

            .backup-preview-header span {
                color: #64748b;
                overflow-wrap: anywhere;
            }

            .backup-valid-badge {
                align-self: flex-start;
                padding: 5px 9px;
                border-radius: 999px;
                color: #166534 !important;
                background: #dcfce7;
                font-size: 0.78rem;
                font-weight: 800;
            }

            .backup-details {
                display: grid;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                gap: 12px;
                margin: 18px 0 0;
            }

            .backup-details div {
                padding: 12px;
                border-radius: 12px;
                background: rgba(255, 255, 255, 0.75);
            }

            .backup-details dt {
                margin-bottom: 4px;
                color: #64748b;
                font-size: 0.8rem;
            }

            .backup-details dd {
                margin: 0;
                font-weight: 800;
            }

            .backup-message {
                margin: 16px 0 0;
                padding: 13px 15px;
                border-radius: 12px;
                line-height: 1.45;
            }

            .backup-message.success {
                color: #166534;
                background: #dcfce7;
            }

            .backup-message.error {
                color: #991b1b;
                background: #fee2e2;
            }

            .backup-warning {
                margin-top: 18px;
                padding: 14px 16px;
                border-radius: 14px;
                color: #854d0e;
                background: #fef9c3;
                line-height: 1.5;
            }

            @media (max-width: 720px) {

                .backup-actions-grid,
                .backup-details {
                    grid-template-columns: 1fr;
                }

                .backup-section {
                    padding: 18px;
                }

            }

        `;

        document.head.appendChild(style);

    }

};

window.BackupUI =
    BackupUI;

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            BackupUI.initialize();

        }
    );

} else {

    BackupUI.initialize();

}
