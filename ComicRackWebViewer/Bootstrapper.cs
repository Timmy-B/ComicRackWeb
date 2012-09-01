using System;
using System.Windows;
using System.Collections.Generic;
using System.IO;
using System.Reflection;
using Nancy;
using Nancy.Bootstrapper;
using Nancy.ViewEngines.Razor;
using Nancy.Conventions;
using Nancy.Diagnostics;
using TinyIoC;
using Nancy.ErrorHandling;
using Nancy.Extensions;
using BCR;

namespace ComicRackWebViewer
{
  /*
  public class LoggingErrorHandler : IErrorHandler
  {
      public bool HandlesStatusCode(HttpStatusCode statusCode, NancyContext context)
      {
          return true;//statusCode == HttpStatusCode.InternalServerError;
      }
  
      public void Handle(HttpStatusCode statusCode, NancyContext context)
      {
        
          object errorObject;
          context.Items.TryGetValue(NancyEngine.ERROR_EXCEPTION, out errorObject);
          var error = errorObject as Exception;
          
  

      }
  }
  */

    public class Bootstrapper : DefaultNancyBootstrapper
    {
        protected override void ApplicationStartup(TinyIoCContainer container, IPipelines pipelines)
        {
            base.ApplicationStartup(container, pipelines);
            
            // Increase size of JSON responses as 100K is way too small for a large comic collection. Make it 10M.
            // Also, for some reason I don't get InvalidOperationException ("Nancy.Json.JsonSettings.MaxJsonLength exceeded")
            // Instead Nancy generates a response with status OK and content length 0.
            Nancy.Json.JsonSettings.MaxJsonLength = 10000000; 
            
            // Case sensitivity is buggy in Nancy, so disable it. Or maybe I should generate/parse GUIDs correctly......
            StaticConfiguration.CaseSensitive = false;
            
#if DEBUG
            StaticConfiguration.DisableCaches = true;
            
#else
			      StaticConfiguration.DisableCaches = false;
#endif

            container.Register<IRazorConfiguration, RazorConfiguration>().AsSingleton();
            container.Register<RazorViewEngine>();
            container.Register<IRootPathProvider, RootPathProvider>().AsSingleton();
            
            this.Conventions.ViewLocationConventions.Add((viewName, model, context) =>
            {
                return string.Concat("original/Views/", viewName);
            });
            
            StaticConfiguration.EnableRequestTracing = BCRSettingsStore.Instance.nancy_request_tracing;
            
            if (BCRSettingsStore.Instance.nancy_diagnostics_password == "")
              DiagnosticsHook.Disable(pipelines);
            
            // Make sure static content isn't cached, because this really messes up the ipad browsers (Atomic Browser specifically) 
            // when the app is frequently updated.
            pipelines.AfterRequest += ctx => {
              var c = ctx as NancyContext; // just for autocompletion in SharpDevelop....
              //string value;
              //if (c.Response.Headers.TryGetValue("Cache-Control", value))
              {
                c.Response.Headers.Add("Cache-Control", "no-cache");
              }
            };
        }
       

        protected override void ConfigureApplicationContainer(TinyIoCContainer container)
        {
            //don't do auto register
            //base.ConfigureApplicationContainer(container);
            container.AutoRegister(new List<Assembly>() { typeof(Bootstrapper).Assembly, typeof(RazorViewEngine).Assembly });
        }

        /*
        private ModuleRegistration CreateRegistration<Tmodule>()
        {
            Type t = typeof(Tmodule);
            return new ModuleRegistration(t, this.GetModuleKeyGenerator().GetKeyForModuleType(t));
        }
        */
        
        protected override void ConfigureConventions(NancyConventions conventions)
	      {
	        base.ConfigureConventions(conventions);
	 
	        conventions.StaticContentsConventions.Add(
            	StaticContentConventionBuilder.AddDirectory("/tablet", "/tablet")
        	);
	        conventions.StaticContentsConventions.Add(
            	StaticContentConventionBuilder.AddDirectory("/original", "/original")
        	);
	      }
        
        protected override DiagnosticsConfiguration DiagnosticsConfiguration
        {
          get { return new DiagnosticsConfiguration { Password = BCRSettingsStore.Instance.nancy_diagnostics_password }; }
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
