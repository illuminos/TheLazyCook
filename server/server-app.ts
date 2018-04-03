class ServerApp{

	private app: express.Application;
	private db:orientjs.Db;

	setRoutes():void {
		
		this.app.use(bodyParser.json());
		this.app.use(bodyParser.urlencoded({
			extended:false
		}));

		//TODO WARNING: the secret should not be stored in code.(Dev purposes only)
		//TODO Replace with mongo connect or redis store, in memory is not suitable for production
		this.app.use(session({secret:"sdf923jk23asf01gasds42",saveUninitialized:true,resave:false}));

		//setup file uploads using multer
		this.app.use(uploader);
		this.configureAPIRoutes();
		
		//static resources (is amongst the main folders in the root of the project)
		this.app.use('/', express.static(path.join(__dirname, '../', 'dist')));//for one level

		//all other routes are handled by angular
		this.app.get('/*', this._homePage);//this should be in the end

	}

	start():void {
		// TODO
	}
}