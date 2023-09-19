package MyLibrary "My awesome Modelica library"
  package Mechanics
    package MultiBody
      package Examples
        model Pendulum
          extends Modelica.Mechanics.MultiBody.Examples.Elementary.Pendulum;
        end Pendulum;
      end Examples;
    end MultiBody;
  end Mechanics;
  package Blocks
    package Examples
      model PID_Controller
        extends Modelica.Blocks.Examples.PID_Controller;
      end PID_Controller;
    end Examples;
  end Blocks;
  annotation(
    uses(Modelica(version = "4.0.0")),
    version = "1.0.0");
end MyLibrary;
