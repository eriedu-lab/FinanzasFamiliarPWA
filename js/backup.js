"use strict";

/*
=====================================
    FINANZAS FAMILIAR
    Respaldo y restauración
=====================================
*/

const BackupManager = {

    formatVersion: 1,

    appName: "Finanzas Familiar",

    createBackup() {

        const storedData = {};

        for (
            let index = 0;
            index < localStorage.length;
            index += 1
        ) {

            const key =
                localStorage.key(index);

            if (!key) {

                continue;

            }

            storedData[key] =
                localStorage.getItem(key);

        }

        return {

            app:
                this.appName,

            formatVersion:
                this.formatVersion,

            createdAt:
                new Date().toISOString(),

            device:
                navigator.userAgent,

            itemCount:
                Object.keys(storedData).length,

            data:
                storedData

        };

    },

    exportBackup() {

        const backup =
            this.createBackup();

        const jsonContent =
            JSON.stringify(
                backup,
                null,
                2
            );

        const file =
            new Blob(
                [jsonContent],
                {
                    type:
                        "application/json;charset=utf-8"
                }
            );

        const downloadUrl =
            URL.createObjectURL(file);

        const link =
            document.createElement("a");

        link.href =
            downloadUrl;

        link.download =
            this.createFileName();

        document.body.appendChild(link);

        link.click();

        link.remove();

        setTimeout(
            function () {

                URL.revokeObjectURL(
                    downloadUrl
                );

            },
            1000
        );

        return {

            success: true,

            backup

        };

    },

    async readBackupFile(file) {

        if (!(file instanceof File)) {

            return {

                success: false,

                message:
                    "Selecciona un archivo de respaldo."

            };

        }

        if (
            !file.name
                .toLowerCase()
                .endsWith(".json")
        ) {

            return {

                success: false,

                message:
                    "El respaldo debe ser un archivo JSON."

            };

        }

        try {

            const text =
                await file.text();

            const backup =
                JSON.parse(text);

            const validation =
                this.validateBackup(backup);

            if (!validation.success) {

                return validation;

            }

            return {

                success: true,

                backup

            };

        } catch (error) {

            return {

                success: false,

                message:
                    "No fue posible leer el archivo. Puede estar dañado o tener un formato incorrecto."

            };

        }

    },

    validateBackup(backup) {

        if (
            !backup ||
            typeof backup !==
                "object" ||
            Array.isArray(backup)
        ) {

            return {

                success: false,

                message:
                    "El archivo no contiene un respaldo válido."

            };

        }

        if (
            backup.app !==
            this.appName
        ) {

            return {

                success: false,

                message:
                    "Este archivo no pertenece a Finanzas Familiar."

            };

        }

        if (
            Number(backup.formatVersion) !==
            this.formatVersion
        ) {

            return {

                success: false,

                message:
                    "La versión del respaldo no es compatible con esta aplicación."

            };

        }

        if (
            !backup.data ||
            typeof backup.data !==
                "object" ||
            Array.isArray(backup.data)
        ) {

            return {

                success: false,

                message:
                    "El respaldo no contiene información restaurable."

            };

        }

        const entries =
            Object.entries(backup.data);

        for (
            const [key, value]
            of entries
        ) {

            if (
                typeof key !==
                    "string" ||
                typeof value !==
                    "string"
            ) {

                return {

                    success: false,

                    message:
                        "El respaldo contiene datos con un formato inválido."

                };

            }

            try {

                JSON.parse(value);

            } catch (error) {

                return {

                    success: false,

                    message:
                        `El dato almacenado en "${key}" está dañado.`

                };

            }

        }

        return {

            success: true

        };

    },

    restoreBackup(backup) {

        const validation =
            this.validateBackup(backup);

        if (!validation.success) {

            return validation;

        }

        try {

            localStorage.clear();

            Object.entries(
                backup.data
            ).forEach(
                function (
                    [key, value]
                ) {

                    localStorage.setItem(
                        key,
                        value
                    );

                }
            );

            return {

                success: true,

                restoredItems:
                    Object.keys(
                        backup.data
                    ).length

            };

        } catch (error) {

            return {

                success: false,

                message:
                    "No fue posible restaurar el respaldo."

            };

        }

    },

    createFileName() {

        const now =
            new Date();

        const year =
            now.getFullYear();

        const month =
            String(
                now.getMonth() + 1
            ).padStart(
                2,
                "0"
            );

        const day =
            String(
                now.getDate()
            ).padStart(
                2,
                "0"
            );

        const hours =
            String(
                now.getHours()
            ).padStart(
                2,
                "0"
            );

        const minutes =
            String(
                now.getMinutes()
            ).padStart(
                2,
                "0"
            );

        return (
            "finanzas-familiar-respaldo-" +
            `${year}-${month}-${day}-` +
            `${hours}${minutes}.json`
        );

    },

    formatDate(value) {

        const date =
            new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return "Fecha desconocida";

        }

        return new Intl.DateTimeFormat(
            "es-MX",
            {
                dateStyle:
                    "medium",

                timeStyle:
                    "short"
            }
        ).format(date);

    }

};

window.BackupManager =
    BackupManager;
