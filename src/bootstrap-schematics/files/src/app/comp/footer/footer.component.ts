import {Component, Input} from '@angular/core';
import {InfoActuator} from '../../dto/info-actuator';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {

  @Input()
  infos: Partial<InfoActuator>;

  @Input()
  year: string;

}
