import ojs= require('orientjs');
import winston=require('winston');
import Promise=require('bluebird');

// TODO taken up from another source, customize as per need

const USER="User";
const FILE="File";
const FOLDER="Folder";
const FILESYSTEM="FileSystem";
const LOCATION="Location";

/** Service class for holding all methods relatedd to database tables */
export class SchemaBackend{

	constructor(private db:ojs.Db){
	}

	/**
	 * Warning: Deletes the records in the database for all tables
	 */
	deleteDatabaseRecords():Promise<any>{
		winston.warn("Deleting DB records");
		return this.db.query("DELETE VERTEX "+LOCATION).
		then((v:any)=>{
			return this.db.query("DELETE VERTEX "+USER)
		}).
		then((v:any)=>{
			return this.db.query("DELETE VERTEX "+FILE);
		}).
		then((v:any)=>{
			return this.db.query("DELETE VERTEX "+FOLDER);
		}).
		then((v:any)=>{
			return this.db.query("DELETE VERTEX "+FILESYSTEM);
		})
	}

	/**
	 * Warning: Drops the entire DB unsafely.
	 * Returns with the promise of the last class dropped in order
	 */
	dropDatabaseSchema():Promise<any>{
		winston.warn("DROPPING DB UNSAFELY!!!");
		return this.db.query("DROP CLASS "+LOCATION+" IF EXISTS UNSAFE").
		then((v:any)=>{
			return this.db.query("DROP CLASS "+USER+" IF EXISTS UNSAFE")
		}).
		then((v:any)=>{
			return this.db.query("DROP CLASS "+FILE+" IF EXISTS UNSAFE");
		}).
		then((v:any)=>{
			return this.db.query("DROP CLASS "+FOLDER+" IF EXISTS UNSAFE");
		}).
		then((v:any)=>{
			return this.db.query("DROP CLASS "+FILESYSTEM+" IF EXISTS UNSAFE");
		})
	}

	/**
	 * Checks if the classes in the database exist or not,
	 * and if not, creates the required classes.
	 */
	ensureDatabaseSchema():Promise<ojs.Class>{
		return this.ensureLocation().
		then((createdClass:ojs.Class)=>{
			return this.ensureUser();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFile();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFolder();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFolderLinksToFileList();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFolderLinksToFolderList();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFolderLinksBackToParentFolder();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFileLinksBackToParentFolder();
		}).
		then((c:ojs.Class)=>{
			return this.ensureFileSystem();
		}).
		then((c:ojs.Class)=>{
			return this.ensureUserLinksToFileSystem();
		})
	}

	private ensureFile():Promise<ojs.Class>{
		return this.createClassIfNotExists(FILE,[
			{name:"name",type:"String"},
			{name:"filepath",type:"String"},
			{name:"uploadDate",type:"Date"},
			{name:"owner",type:"Link", linkedClass:USER}
		],"V");//extends the generic 'Vertex' class
	}

	private ensureFolder():Promise<ojs.Class>{
		return this.createClassIfNotExists(FOLDER,[
			{name:"name",type:"String"},
			{name:"creationDate",type:"Date"},
			{name:"modificationDate",type:"Date"},
			{name:"owner",type:"Link", linkedClass:USER}
		],"V");//extends the generic 'Vertex' class
	}

	private ensureFileSystem():Promise<ojs.Class>{
		return this.createClassIfNotExists(FILESYSTEM,[
			{name:"topLevelFolders",type:"LinkList",linkedClass:FOLDER},
			{name:"topLevelFiles",type:"LinkList",linkedClass:FILE},
			{name:"creationDate",type:"Date"}
		],"V");//extends the generic 'Vertex' class
	}

	private ensureFolderLinksToFileList():Promise<ojs.Class>{
		return this.db.class.get(FOLDER).
		then((c:ojs.Class)=>{
			return c.property.get("fileList").
			then((progresssion:ojs.Property)=>{
				if(progresssion==null){
					winston.info("Creating a link between folder and its file list");
					return c.property.create({name:"fileList", type:"LinkList", linkedClass:FILE}).
					then((p:ojs.Property)=>{
						return c;
					})
				}else{
					return c;
				}
			})

		})
	}

	private ensureFolderLinksToFolderList():Promise<ojs.Class>{
		return this.db.class.get(FOLDER).
		then((c:ojs.Class)=>{
			return c.property.get("folderList").
			then((progresssion:ojs.Property)=>{
				if(progresssion==null){
					winston.info("Creating a link between folder and its folder list");
					return c.property.create({name:"folderList", type:"LinkList", linkedClass:FOLDER}).
					then((p:ojs.Property)=>{
						return c;
					})
				}else{
					return c;
				}
			})

		})
	}

	private ensureFolderLinksBackToParentFolder():Promise<ojs.Class>{
		return this.db.class.get(FOLDER).
		then((c:ojs.Class)=>{
			return c.property.get("parentFolder").
			then((progresssion:ojs.Property)=>{
				if(progresssion==null){
					winston.info("Creating a back reference to the parent folder in Folder class");
					return c.property.create({name:"parentFolder", type:"Link", linkedClass:FOLDER}).
					then((p:ojs.Property)=>{
						return c;
					})
				}else{
					return c;
				}
			})

		})
	}

	private ensureFileLinksBackToParentFolder():Promise<ojs.Class>{
		return this.db.class.get(FILE).
		then((c:ojs.Class)=>{
			return c.property.get("parentFolder").
			then((progresssion:ojs.Property)=>{
				if(progresssion==null){
					winston.info("Creating a back reference to the parent folder in File class");
					return c.property.create({name:"parentFolder", type:"Link", linkedClass:FOLDER}).
					then((p:ojs.Property)=>{
						return c;
					})
				}else{
					return c;
				}
			})

		})
	}

	private ensureUserLinksToFileSystem():Promise<ojs.Class>{
		return this.db.class.get(USER).
		then((c:ojs.Class)=>{
			return c.property.get("fileSystem").
			then((progresssion:ojs.Property)=>{
				if(progresssion==null){
					winston.info("Creating a link between user and file system");
					return c.property.create({name:"fileSystem", type:"Link", linkedClass:FILESYSTEM}).
					then((p:ojs.Property)=>{
						return c;
					})
				}else{
					return c;
				}
			})

		})
	}

	private ensureUser():Promise<ojs.Class>{
		return this.createClassIfNotExists(USER,[
			{name:"firstName",type:"String"},
			{name:"lastName",type:"String"},
			{name:"email",type:"String"},
			{name:"password",type:"String"},
			{name:"gender",type:"String"},
			{name:"linkToProfilePic",type:"String"},
			{name:"dateOfBirth",type:"Date"},
			{name:"address",type:"Embedded", linkedClass:LOCATION},
		],"V");//extends the generic 'Vertex' class
	}

	private ensureLocation():Promise<ojs.Class>{
		return this.createClassIfNotExists(LOCATION,[
			{name:"streetAddress",type:"String"},
			{name:"city",type:"String"},
			{name:"state",type:"String"},
			{name:"country",type:"String"},
			{name:"zipcode",type:"String"}
		]);
	}

	/**
	 * Creates a class that can optionally extend another 'known' class.
	 * The properties  is an array of properties 'with known types'.
	 * Meaning that a property can only refer a type that has been defined previously
	 * Each element must be of the form {name:"<name>",type:"<type>"} plus more(refer Property interface)
	 * Example:
	 * {name:"lastName",type:"String"},
	 * {name:"dateOfBirth",type:"Date"},
	 * {name:"favoriteWords",type:"EmbeddedList", linkedType:"String"},
	 * {name:"address",type:"Embedded", linkedClass:"Location"},//Location must be defined earlier
	 * @return the created/existing class as a promise.(Does not change properties of existing class)
	 */
	public createClassIfNotExists(className:string,propertiesWithKnownTypes:any[],superClass:string=null):Promise<ojs.Class>{
		return this.db.class.list(true).
		then((classes:ojs.Class[])=>{
			let existingClass:ojs.Class=null;
			winston.log("info","Searching for '"+className+"' class amongst "+classes.length+" classes");
			for(let singleClass of classes){
				if(singleClass.name==className){
					existingClass=singleClass
					break;
				}
			}
			return existingClass;
		}).then((existingClass:ojs.Class)=>{

			if(existingClass!=null){
				winston.info(existingClass.name+" class already exists");
				return existingClass;
			}else{
				let afterClassIsCreated:Promise<ojs.Class>=null;
				if(superClass==null || superClass.trim()==""){
					afterClassIsCreated=this.db.class.create(className);
				}else{
					afterClassIsCreated=this.db.class.create(className,superClass);
				}
				
				return afterClassIsCreated.
				then((createdClass:ojs.Class)=>{
					winston.info("Not found, Created class : "+createdClass.name);
					winston.info("Defining properties for class : "+createdClass.name);
					return createdClass.property.create(propertiesWithKnownTypes).
					then((properties:ojs.Property[])=>{
						return createdClass;
					});
				});
			}
			
		});
	}
}