import { Component } from '@angular/core';
import { User } from './dto/user';
import { InfoActuator } from './dto/info-actuator';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Angular SMA';
  user: User = {
    badge: 'A10000', nom: 'SMA', prenom: 'User', siteGestion: 'SG26', sgLabel: 'UGS Auto flottes',
    posteOp: 'SG12SALI', habilitations: ['EDIT'], profil: 'Administrateur', version: 'V-1.0.1'
  };
  infoConnection = {
    lastLogin: 1582820287, currentTime: Date.now()
  };
  urlLogo = 'assets/img/logo_accueil.png';
  infos: Partial<InfoActuator> = {
    build: {
      version: '1.0.0'
    }
  }
  year = '2020';

}
