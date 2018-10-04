import {MendixSdkClient, Project, OnlineWorkingCopy, Revision, Branch} from 'mendixplatformsdk/dist';
import {utils, StructuralUnit, IStructuralUnit, projects, constants, 
        javaactions, pages, microflows, enumerations, exportmappings, importmappings,
        scheduledevents, xmlschemas, domainmodels, images, jsonstructures} from 'mendixmodelsdk/dist';
import when = require('when');
import config = require('./config.json');
import fs = require('fs');
var path = require('path');

const client = new MendixSdkClient(config.auth.username, config.auth.apikey);
const project = new Project(client,config.project.id, config.project.name);
const revision = new Revision(-1, new Branch(project,config.project.branch)); // always use the latest revision

async function serialize(){
    const wc : OnlineWorkingCopy = await client.platform().createOnlineWorkingCopy(project, revision);
    
    const projectName = wc.project().name();
    const projectPath = `./out/${projectName}`;

    if( fs.existsSync(projectPath)){
        console.log("Project output folder ${projectPath} already exists. Please delete the project output folder and try again");
        return;    
    }

    fs.mkdirSync(projectPath);
    await exportModuleDocuments(wc, projectPath);
    await exportModuleSecurities(wc, projectPath);
}

serialize();

async function exportModuleSecurities(wc : OnlineWorkingCopy, projectPath : string){
    const securities = wc.model().allModuleSecurities();

    for(const security of securities){
        const loadedSecurity = await loadAsPromise(security);     
        const moduleName = loadedSecurity.containerAsModule.name;
        const modulePath = path.join(projectPath, moduleName);
        if( !fs.existsSync(modulePath)){
            fs.mkdirSync(modulePath);
        }
        const serialised = utils.serializeToJs(loadedSecurity);
        
        var filepath = getSanitisedAndUniqueFilePath(modulePath, `${loadedSecurity.containerAsModule.name} (Security)`,'_');
        fs.writeFileSync(filepath,serialised );
    }
}

async function exportModuleDocuments(wc : OnlineWorkingCopy, projectPath : string){
    const documents = wc.model().allModuleDocuments();

    for(const document of documents){
        const moduleName = getContainingModuleName(document.container);
        const modulePath = path.join(projectPath, moduleName);
        if( !fs.existsSync(modulePath)){
            fs.mkdirSync(modulePath);
        }        

        const loadedDocument = await loadAsPromise(document);
        const serialised = utils.serializeToJs(loadedDocument);
        
        const documentName = getModuleDocumentName(loadedDocument);

        var filepath = getSanitisedAndUniqueFilePath(modulePath, `${documentName}`,'_');
        fs.writeFileSync(filepath,serialised );
    }
}

function getContainingModuleName(container : IStructuralUnit) : string{
    if(container.structureTypeName === "Projects$Folder"){
        return getContainingModuleName(container.container)
    }
    else {
        return (container as projects.Module).name
    }    
}

function getModuleDocumentName(document : projects.ModuleDocument) : string {
    switch(document.structureTypeName){
        case "Constants$Constant":
            return (document as constants.Constant).name;
        case "JavaActions$JavaAction":
                return (document as javaactions.JavaAction).name;
        case "Pages$BuildingBlock":
                return (document as pages.BuildingBlock).name;
        case "Pages$Layout":
                return (document as pages.Layout).name;
        case "Pages$Page":
                return (document as pages.Page).name;
        case "Pages$Snippet":
                return (document as pages.Snippet).name;   
        case "Pages$PageTemplate":
                return (document as pages.PageTemplate).name;             
        case "Microflows$Nanoflow":
                return (document as microflows.Nanoflow).name;               
        case "Microflows$Rule":
                return (document as microflows.Rule).name;             
        case "Microflows$Microflow":
                return (document as microflows.Microflow).name;             
        case "Enumerations$Enumeration":
                return (document as enumerations.Enumeration).name;               
        case "ImportMappings$ImportMapping":
                return (document as importmappings.ImportMapping).name;               
        case "ExportMappings$ExportMapping":
                return (document as exportmappings.ExportMapping).name;             
        case "ScheduledEvents$ScheduledEvent":
                return (document as scheduledevents.ScheduledEvent).name;           
        case "XmlSchemas$XmlSchema":
                return (document as xmlschemas.XmlSchema).name;                    
        case "Images$ImageCollection":
                return (document as images.ImageCollection).name;                    
        case "JsonStructures$JsonStructure":
                return (document as jsonstructures.JsonStructure).name;          
        case "DomainModels$DomainModel":
                return `${document.containerAsModule.name} (Domain Model)`;
        default:
            console.log(`Structure Type ${document.structureTypeName} not yet handled in getModuleDocumentName. Using Document ID for name.`);
            return document.id;
    }
}
    
function getSanitisedAndUniqueFilePath(basePath : string, filename : string | null, replaceValue : string, attempt : number = 1) : string {
    filename = filename || "";
    filename = filename.replace(/[/\\?%*:|"<>]/g, replaceValue);
    let filePath = path.join(basePath, filename);

    if(fs.existsSync(filePath)){
        filename = filename + `${attempt}`;
        filePath = getSanitisedAndUniqueFilePath(basePath, filename, replaceValue, attempt++);
    }

    return filePath;
}

interface Loadable<T> {
    load(callback: (result: T) => void): void;
}

function loadAsPromise<T>(loadable: Loadable<T>): when.Promise<T> {
    return when.promise<T>((resolve, reject) => loadable.load(resolve));
}
