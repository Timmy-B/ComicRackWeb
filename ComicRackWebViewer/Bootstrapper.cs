using System;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.ViewEngines.Razor;
using Nancy.Conventions;
using TinyIoC;

namespace ComicRackWebViewer
{
    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);
#if DEBUG
            StaticConfiguration.DisableCaches = true;
#else
			StaticConfiguration.DisableCaches = false;
#endif            
            container.Register<IRazorConfiguration, RazorConfiguration>().AsSingleton();
            container.Register<RazorViewEngine>();
            container.Register<IRootPathProvider, RootPathProvider>().AsSingleton();
        }

        protected override IEnumerable<ModuleRegistration> Modules
        {
            get
            {
                yield return CreateRegistration<IndexModule>();
                yield return CreateRegistration<PublishersModule>();
                yield return CreateRegistration<SeriesModule>();
                yield return CreateRegistration<ComicsModule>();
                yield return CreateRegistration<ListModule>();
                yield return CreateRegistration<BCRModule>();
            }
        }

        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            //don't do auto register
            //base.ConfigureApplicationContainer(container);
            container.AutoRegister(new List<Assembly>() { typeof(Bootstrapper).Assembly, typeof(RazorViewEngine).Assembly });
        }

        private ModuleRegistration CreateRegistration<Tmodule>()
        {
            Type t = typeof(Tmodule);
            return new ModuleRegistration(t, this.GetModuleKeyGenerator().GetKeyForModuleType(t));
        }
        
        protected override void ConfigureConventions(NancyConventions conventions)
	    {
	        base.ConfigureConventions(conventions);
	 
	        conventions.StaticContentsConventions.Add(
            	StaticContentConventionBuilder.AddDirectory("/bcr", @"/bcr")
        	);
	    }
    }

    public class RootPathProvider : IRootPathProvider
    {
        private readonly string BASE_PATH;

        public RootPathProvider()
        {
            var path = typeof(Bootstrapper).Assembly.Location;
            BASE_PATH = path.Substring(0, path.Length - Path.GetFileName(path).Length);
        }

        public string GetRootPath()
        {
            return BASE_PATH;
        }
    }

    public class RazorConfiguration : IRazorConfiguration
    {
        public bool AutoIncludeModelNamespace
        {
            get { return false; }
        }

        public IEnumerable<string> GetAssemblyNames()
        {
            yield return "System, Version=4.0.0.0, Culture=neutral, PublicKeyToken=b77a5c561934e089";
            yield return "ComicRackWebViewer";
            yield return "ComicRack.Engine";
            yield return "cYo.Common";
        }

        public IEnumerable<string> GetDefaultNamespaces()
        {
            yield return "ComicRackWebViewer";
            yield return "System.Linq";
            yield return "System.Collections.Generic";
            yield return "cYo.Projects.ComicRack.Engine";
            yield return "cYo.Projects.ComicRack.Engine.Database";
        }
    }
}
